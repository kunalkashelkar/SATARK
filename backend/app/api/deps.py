from typing import Callable, Generator, List, Optional
from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.core.exceptions import UnauthorizedException, ForbiddenException, NotFoundException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.cse import CSE
from app.db.models.user_cse_access import UserCseAccess


def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer <token>"),
    db: Session = Depends(get_db)
) -> User:
    """Validate Bearer JWT and return authenticated User with active role and permissions."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid Authorization header (Bearer token required)")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    user_public_id = payload.get("sub")
    if not user_public_id:
        raise UnauthorizedException("Malformed token: missing subject identifier")

    user = db.query(User).filter(User.public_id == user_public_id).first()
    if not user:
        raise UnauthorizedException(f"Authenticated user '{user_public_id}' not found")

    if user.status != "ACTIVE":
        raise ForbiddenException(f"User account is {user.status.lower()}")

    return user


def require_auth(current_user: User = Depends(get_current_user)) -> User:
    """Dependency ensuring caller is authenticated."""
    return current_user


def require_role(*allowed_roles: str) -> Callable[[User], User]:
    """Dependency factory enforcing one of the specified roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        role_name = current_user.role.name if current_user.role else ""
        if role_name not in allowed_roles:
            raise ForbiddenException(
                f"Role '{role_name}' is not authorized. Required: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker


def require_permission(permission_code: str) -> Callable[[User], User]:
    """Dependency factory enforcing that user has the specified permission."""
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        user_permissions = []
        if current_user.role and current_user.role.permissions:
            user_permissions = [p.code for p in current_user.role.permissions]

        if permission_code not in user_permissions:
            raise ForbiddenException(
                f"Missing required permission: '{permission_code}'"
            )
        return current_user

    return permission_checker


def check_cse_access(cse_id: str, user: User, db: Session) -> CSE:
    """Validate that the user has supervisory or examiner scope over the specified CSE."""
    import uuid
    query = db.query(CSE)
    try:
        val_uuid = uuid.UUID(str(cse_id))
        query = query.filter((CSE.public_id == cse_id) | (CSE.id == val_uuid))
    except (ValueError, AttributeError):
        query = query.filter(CSE.public_id == cse_id)

    cse = query.first()

    if not cse:
        raise NotFoundException("CSE", cse_id)

    role_name = user.role.name if user.role else ""
    # Supervisors, Lead Examiners, and Administrators possess universal scope
    if role_name in ["SUPERVISOR", "LEAD_EXAMINER", "ADMINISTRATOR"]:
        return cse

    # Examiners must have an explicit assignment in user_cse_access
    access = db.query(UserCseAccess).filter(
        UserCseAccess.user_id == user.id,
        UserCseAccess.cse_id == cse.id
    ).first()

    if not access:
        raise ForbiddenException(
            f"Examiner '{user.username}' is not assigned to Critical Sector Entity '{cse.public_id}'"
        )

    return cse
