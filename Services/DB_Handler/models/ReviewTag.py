from sqlalchemy import Column, Integer, ForeignKey
from .base import Base


class ReviewTag(Base):
    __tablename__ = 'review_tag'

    review_id = Column(Integer, ForeignKey("review.review_id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tag.tag_id"), primary_key=True)
