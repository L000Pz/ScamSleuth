from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Admins(Base):
    __tablename__ = 'admins'

    admin_id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    contact_info = Column(String(255), nullable=False)
    bio = Column(String(255))
    profile_picture_id = Column(Integer)  # no FK to media
    password = Column(String, nullable=False)

    admin_reviews = relationship("AdminReview", back_populates="admin")
