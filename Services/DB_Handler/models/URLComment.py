from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from .base import Base


class URLComment(Base):
    __tablename__ = 'url_comment'

    comment_id = Column(Integer, primary_key=True, nullable=False)
    url_id = Column(Integer, ForeignKey("url_storage.url_id"), nullable=False)
    writer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    root_id = Column(Integer, ForeignKey("url_comment.comment_id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False)
    comment_content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)


