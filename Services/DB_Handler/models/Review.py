from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Review(Base):
    __tablename__ = 'review'

    review_id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String(50), nullable=False)
    writer_id = Column(Integer, ForeignKey("admins.admin_id"))
    scam_type_id = Column(Integer, ForeignKey("scam_type.scam_type_id"))
    review_date = Column(Date, nullable=False)
    review_content_id = Column(Integer, nullable=False)
    views = Column(Integer, default=0)

