from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Review(Base):
    __tablename__ = 'review'

    review_id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String(50), nullable=False)
    scam_type_id = Column(Integer, ForeignKey("scam_type.scam_type_id"))
    review_date = Column(Date, nullable=False)
    review_content_id = Column(Integer, ForeignKey("review_content.review_content_id"), nullable=False)

    scam_type = relationship("ScamType", back_populates="reviews")
    review_content = relationship("ReviewContent", back_populates="review", uselist=False)
    admin_reviews = relationship("AdminReview", back_populates="review")
    banners = relationship("ReviewBanner", back_populates="review")
    comments = relationship("ReviewComment", back_populates="review")
