from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class ScamType(Base):
    __tablename__ = 'scam_type'

    scam_type_id = Column(Integer, primary_key=True, nullable=False)
    scam_type = Column(String(50), unique=True, nullable=False)


