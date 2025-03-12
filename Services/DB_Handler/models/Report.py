from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Report(Base):
    __tablename__ = 'report'

    report_id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String(50), nullable=False)
    scam_type_id = Column(Integer, ForeignKey("scam_type.scam_type_id"))
    scam_date = Column(Date, nullable=False)
    financial_loss = Column(Numeric, nullable=False)
    description = Column(String(255), nullable=False)

    scam_type = relationship("ScamType", back_populates="reports")
    report_media = relationship("ReportMedia", back_populates="report")
    user_reports = relationship("UserReport", back_populates="report")
