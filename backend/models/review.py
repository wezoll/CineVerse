from extensions import db
from datetime import datetime, timedelta

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, nullable=True)
    series_id = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('reviews', lazy=True))

    def to_dict(self):
        kz_offset = timedelta(hours=5)
        created_at_kz = self.created_at + kz_offset
        updated_at_kz = self.updated_at + kz_offset

        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'series_id': self.series_id,
            'user_id': self.user_id,
            'user_name': f"{self.user.first_name} {self.user.last_name}" if self.user.first_name or self.user.last_name else "Пользователь",
            'user_first_name': self.user.first_name or "",
            'user_last_name': self.user.last_name or "",
            'user_email': self.user.email or "",
            'rating': self.rating,
            'content': self.content or "",
            'created_at': created_at_kz.strftime('%d.%m.%Y %H:%M'),
            'updated_at': updated_at_kz.strftime('%d.%m.%Y %H:%M'),
            'source': 'local'
        }

    def __repr__(self):
        content_type = "movie" if self.movie_id else "series"
        content_id = self.movie_id if self.movie_id else self.series_id
        return f"<Review {self.id} for {content_type} {content_id} by user {self.user_id}>"