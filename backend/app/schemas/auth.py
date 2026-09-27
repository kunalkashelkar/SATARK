from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Enclave username or statutory ID")
    password: str = Field(..., description="Password or cryptographic pin")


class UserInfoResponse(BaseModel):
    id: str = Field(..., description="Public user ID, e.g. USR-001")
    username: str
    display_name: str
    role: str
    status: str
    organization: Optional[str] = None
    badge: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfoResponse
