from sqlalchemy import Column, Integer, String
from .base import Base


class Tag(Base):
    __tablename__ = 'tag'

    tag_id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(50), nullable=False)
