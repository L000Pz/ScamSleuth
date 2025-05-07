from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import Base


class Conversation(Base):
    __tablename__ = 'conversation'

    conversation_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    admin_id = Column(Integer, ForeignKey("admins.admin_id"))
    created_at = Column(DateTime)

