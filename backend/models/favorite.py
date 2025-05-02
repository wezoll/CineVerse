from datetime import datetime
from extensions import db

class Favorite(db.Model):
    __tablename__ = 'favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, nullable=False) 
    item_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('favorites', lazy='dynamic'))
    
    def __init__(self, user_id, item_id, item_type):
        self.user_id = user_id
        self.item_id = item_id
        self.item_type = item_type
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'item_id': self.item_id,
            'item_type': self.item_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }