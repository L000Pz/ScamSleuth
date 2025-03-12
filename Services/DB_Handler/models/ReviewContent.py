from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class ReviewContent(Base):
    __tablename__ = 'review_content'

    review_content_id = Column(Integer, primary_key=True, nullable=False)
    review_content = Column(String, nullable=False)

    review = relationship("Review", back_populates="review_content")
    media = relationship("ReviewContentMedia", back_populates="review_content")
