from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.security import verify_password, create_access_token
from app.db.models.user import User
from app.schemas.auth import TokenResponse, UserInfoResponse


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> User:
        user = db.query(User).filter(User.username == username).first()
        if not user or not user.hashed_password:
            raise UnauthorizedException("Invalid username or credentials")

        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid username or credentials")

        if user.status != "ACTIVE":
            raise ForbiddenException(f"User account '{username}' is {user.status.lower()}")

        # Update last activity
        user.last_activity_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
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
