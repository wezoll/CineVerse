from extensions import db
from datetime import datetime

class HiddenContent(db.Model):
    __tablename__ = 'hidden_content'
    
    id = db.Column(db.Integer, primary_key=True)
    item_type = db.Column(db.String(50), nullable=False)
    item_id = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=True)
    hidden_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('item_type', 'item_id', name='unique_hidden_content'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_type': self.item_type,
            'item_id': self.item_id,
            'reason': self.reason,
            'hidden_by': self.hidden_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 