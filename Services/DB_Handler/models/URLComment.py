from sqlalchemy import Column, Integer, DateTime, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from .base import Base


class URLComment(Base):
    __tablename__ = 'url_comment'

    comment_id = Column(Integer, primary_key=True, nullable=False)
    url_id = Column(Integer, ForeignKey("url_storage.url_id"), nullable=False)
    writer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    root_id = Column(Integer, ForeignKey("url_comment.comment_id"), nullable=False)
    rating = Column(DECIMAL, nullable=False)
    description = Column(String(255), nullable=False)


