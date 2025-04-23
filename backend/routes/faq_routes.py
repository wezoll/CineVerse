from flask import Blueprint, jsonify
from models.faq import FAQ

faq_bp = Blueprint('faq', __name__)

@faq_bp.route('/', methods=['GET'])
def get_faqs():
    faqs = FAQ.query.filter_by(is_active=True).order_by(FAQ.order).all()
    return jsonify([faq.to_dict() for faq in faqs])