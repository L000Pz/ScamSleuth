from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from .base import Base


class URLStorage(Base):
    __tablename__ = 'url_storage'

    url_id = Column(Integer, primary_key=True, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String(255))
    search_date = Column(DateTime)

