import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID
from app.db.models.role import role_permissions


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    code = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
