from sqlalchemy import Column, Integer, ForeignKey

from .base import Base


class ReviewContentMedia(Base):
    __tablename__ = 'review_content_media'

    review_id = Column(Integer, ForeignKey("review.review_id"), primary_key=True)
    media_id = Column(Integer, primary_key=True)
