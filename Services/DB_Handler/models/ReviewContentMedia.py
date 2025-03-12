from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class ReviewContentMedia(Base):
    __tablename__ = 'review_content_media'

    review_content_id = Column(Integer, ForeignKey("review_content.review_content_id"), primary_key=True)
    media_id = Column(Integer, primary_key=True)  # No FK to media

    review_content = relationship("ReviewContent", back_populates="media")
