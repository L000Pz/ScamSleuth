from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class ReviewBanner(Base):
    __tablename__ = 'review_banner'

    review_id = Column(Integer, ForeignKey("review.review_id"), primary_key=True)
    media_id = Column(Integer, primary_key=True)  # No FK to media

    review = relationship("Review", back_populates="banners")
