from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class ReportMedia(Base):
    __tablename__ = 'report_media'

    report_id = Column(Integer, ForeignKey("report.report_id"), primary_key=True)
    media_id = Column(Integer, primary_key=True)

