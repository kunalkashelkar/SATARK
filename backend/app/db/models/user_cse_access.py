import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class UserCseAccess(Base):
    __tablename__ = "user_cse_access"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    access_type = Column(String(64), default="Full Supervisory", nullable=False)
    granted_by = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", backref="cse_access_rules")
    cse = relationship("CSE", backref="user_access_rules")

    __table_args__ = (
        UniqueConstraint("user_id", "cse_id", name="uq_user_cse_access"),
    )
