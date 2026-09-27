from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserInfoResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Session"])


@router.post("/login", response_model=TokenResponse, summary="Enclave Authentication")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate enclave supervisor/examiner with username and password."""
    user = AuthService.authenticate_user(db, request.username, request.password)
    return AuthService.create_user_token(user)


@router.get("/me", response_model=UserInfoResponse, summary="Current Authenticated User")
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile and role of the currently logged-in user."""
    return UserInfoResponse(
        id=current_user.public_id,
        username=current_user.username,
        display_name=current_user.name,
        role=current_user.role.name if current_user.role else "USER",
        status=current_user.status,
        organization=current_user.organization,
        badge=current_user.badge,
    )


@router.post("/logout", summary="Session Logout")
def logout(current_user: User = Depends(get_current_user)):
    """Terminate the current enclave session."""
    return {
        "success": True,
        "message": f"Session for user '{current_user.username}' successfully terminated."
    }
