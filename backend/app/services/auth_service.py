from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.security import verify_password, create_access_token
from app.db.models.user import User
from app.schemas.auth import TokenResponse, UserInfoResponse


from app.services.audit_service import AuditService


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> User:
        user = db.query(User).filter(User.username == username).first()
        if not user or not user.hashed_password:
            # Audit log: LOGIN_FAILURE
            try:
                AuditService.log_event(
                    db=db,
                    action="LOGIN_FAILURE",
                    actor_id=username or "UNKNOWN",
                    entity_type="AUTH",
                    entity_id=username,
                    reason="Invalid username or credentials",
                )
            except Exception:
                pass
            raise UnauthorizedException("Invalid username or credentials")

        if not verify_password(password, user.hashed_password):
            # Audit log: LOGIN_FAILURE
            try:
                AuditService.log_event(
                    db=db,
                    action="LOGIN_FAILURE",
                    actor_id=user.public_id,
                    entity_type="AUTH",
                    entity_id=user.public_id,
                    reason="Password verification failed",
                )
            except Exception:
                pass
            raise UnauthorizedException("Invalid username or credentials")

        if user.status != "ACTIVE":
            try:
                AuditService.log_event(
                    db=db,
                    action="ACCESS_DENIED",
                    actor_id=user.public_id,
                    entity_type="USER",
                    entity_id=user.public_id,
                    reason=f"User account '{username}' is {user.status.lower()}",
                )
            except Exception:
                pass
            raise ForbiddenException(f"User account '{username}' is {user.status.lower()}")

        # Update last activity
        user.last_activity_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)

        # Audit log: LOGIN_SUCCESS
        try:
            AuditService.log_event(
                db=db,
                action="LOGIN_SUCCESS",
                actor_id=user.public_id,
                entity_type="AUTH",
                entity_id=user.public_id,
                after={"username": user.username, "role": user.role.name if user.role else "USER"},
                examiner_badge=user.badge,
                reason="Enclave session authentication verified",
            )
        except Exception:
            pass

        return user

    @staticmethod
    def create_user_token(user: User) -> TokenResponse:
        role_name = user.role.name if user.role else "USER"
        token_data = {
            "user_id": user.public_id,
            "username": user.username,
            "role": role_name,
        }
        access_token = create_access_token(subject=user.public_id, data=token_data)

        user_info = UserInfoResponse(
            id=user.public_id,
            username=user.username,
            display_name=user.name,
            role=role_name,
            status=user.status,
            organization=user.organization,
            badge=user.badge,
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info,
        )
