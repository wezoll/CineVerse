from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_required, current_user
from models.favorite import Favorite
profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/info', methods=['GET'])
@login_required
def get_profile_info():
    """Get user profile information"""
    return jsonify({
        'user': {
            'id': current_user.id,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'email': current_user.email,
            'created_at': current_user.created_at.strftime('%d.%m.%Y')
        }
    }), 200

@profile_bp.route('/update', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile information"""
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    
    if not first_name or not last_name:
        return jsonify({'error': 'Имя и фамилия обязательны для заполнения'}), 400
    
    try:
        current_user.first_name = first_name
        current_user.last_name = last_name
        db.session.commit()
        
        return jsonify({
            'message': 'Профиль успешно обновлен',
            'user': {
                'id': current_user.id,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'email': current_user.email,
                'created_at': current_user.created_at.strftime('%d.%m.%Y')
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при обновлении профиля: {str(e)}'}), 500

@profile_bp.route('/change-password', methods=['PUT'])
@login_required
def change_password():
    """Change user password"""
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    
    if not current_password or not new_password or not confirm_password:
        return jsonify({'error': 'Все поля обязательны для заполнения'}), 400
    
    if new_password != confirm_password:
        return jsonify({'error': 'Новый пароль и подтверждение пароля не совпадают'}), 400
    
    if len(new_password) < 8:
        return jsonify({'error': 'Пароль должен содержать минимум 8 символов'}), 400
    
    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify({'error': 'Текущий пароль неверен'}), 400
    
    try:
        current_user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Пароль успешно изменен'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при изменении пароля: {str(e)}'}), 500

@profile_bp.route('/favorites', methods=['GET'])
@login_required
def get_user_favorites():
    """Получение списка избранных элементов пользователя для профиля"""
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

