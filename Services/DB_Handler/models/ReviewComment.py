from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class ReviewComment(Base):
    __tablename__ = 'review_comment'

    comment_id = Column(Integer, primary_key=True, nullable=False)
    root_id = Column(Integer, ForeignKey("review_comment.comment_id"), nullable=False)
    review_id = Column(Integer, ForeignKey("review.review_id"), nullable=False)
    writer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    comment_content = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False)


