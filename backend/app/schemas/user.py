from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PermissionResponse(BaseModel):
    id: UUID
    code: str
    description: Optional[str] = None
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    status: str
    permissions: List[PermissionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str
    name: str
    email: EmailStr
    badge: Optional[str] = None
    organization: str = "NCIIPC"
    status: str = "ACTIVE"
    mfa_type: str = "FIPS-140-2 L3 Smartcard"


class UserCreate(UserBase):
    role_id: UUID
    password: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    public_id: str
    role_id: UUID
    role: Optional[RoleResponse] = None
    last_activity_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
