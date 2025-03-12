from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class UserReport(Base):
    __tablename__ = 'user_report'

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    review_id = Column(Integer, ForeignKey("report.report_id"), primary_key=True)

    user = relationship("Users", back_populates="user_reports")
    report = relationship("Report", back_populates="user_reports")
