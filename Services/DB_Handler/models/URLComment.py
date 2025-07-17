from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, String
from .base import Base


class URLComment(Base):
    __tablename__ = 'url_comment'

    comment_id = Column(Integer, primary_key=True, nullable=False)
    url_id = Column(Integer, ForeignKey("url_storage.url_id"), nullable=False)
    writer_id = Column(Integer, nullable=False)
    writer_role = Column(String, nullable=False)
    root_id = Column(Integer, ForeignKey("url_comment.comment_id", ondelete="CASCADE"))
    rating = Column(Integer)
    comment_content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)


