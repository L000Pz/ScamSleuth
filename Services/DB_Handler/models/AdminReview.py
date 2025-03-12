from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class AdminReview(Base):
    __tablename__ = 'admin_review'

    admin_id = Column(Integer, ForeignKey("admins.admin_id"), primary_key=True)
    review_id = Column(Integer, ForeignKey("review.review_id"), primary_key=True)

    admin = relationship("Admins", back_populates="admin_reviews")
    review = relationship("Review", back_populates="admin_reviews")
