from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models.favorite import Favorite
from extensions import db
from models.user import User

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('/api/favorites', methods=['GET'])
@login_required
def get_favorites():
    try:
        favorites = Favorite.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'success': True,
            'favorites': [favorite.to_dict() for favorite in favorites]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@favorites_bp.route('/api/favorites', methods=['POST'])
@login_required
def add_favorite():
    try:
        data = request.get_json()
        
        if not data or 'item_id' not in data or 'item_type' not in data:
            return jsonify({
                'success': False,
                'error': 'Не указаны обязательные поля (item_id, item_type)'
            }), 400
        
        existing_favorite = Favorite.query.filter_by(
            user_id=current_user.id,
            item_id=data['item_id'],
            item_type=data['item_type']
        ).first()
        
        if existing_favorite:
            return jsonify({
                'success': False,
                'error': 'Этот элемент уже в избранном'
            }), 400
        
        new_favorite = Favorite(
            user_id=current_user.id,
            item_id=data['item_id'],
            item_type=data['item_type']
        )
        
        db.session.add(new_favorite)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'favorite': new_favorite.to_dict(),
            'message': 'Элемент добавлен в избранное'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@favorites_bp.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
@login_required
def delete_favorite(favorite_id):
    try:
        favorite = Favorite.query.filter_by(id=favorite_id, user_id=current_user.id).first()
        
        if not favorite:
            return jsonify({
                'success': False,
                'error': 'Элемент не найден в избранном'
            }), 404
        
        db.session.delete(favorite)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Элемент удален из избранного'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@favorites_bp.route('/api/favorites/check', methods=['POST'])
@login_required
def check_favorite():
    try:
        data = request.get_json()
        
        if not data or 'item_id' not in data or 'item_type' not in data:
            return jsonify({
                'success': False,
                'error': 'Не указаны обязательные поля (item_id, item_type)'
            }), 400
        
        favorite = Favorite.query.filter_by(
            user_id=current_user.id,
            item_id=data['item_id'],
            item_type=data['item_type']
        ).first()
        
        return jsonify({
            'success': True,
            'is_favorite': favorite is not None,
            'favorite_id': favorite.id if favorite else None
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 