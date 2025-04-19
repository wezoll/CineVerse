from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.password_reset import PasswordReset
from werkzeug.security import generate_password_hash, check_password_hash
from utils.email_utils import send_password_reset_email
import random
from datetime import datetime, timedelta
from flask_login import login_user, logout_user, login_required, current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')

    if not first_name or not last_name or not email or not password:
        return jsonify({'error': 'Все поля обязательны для заполнения'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Пароль должен содержать минимум 8 символов'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Пользователь с таким email уже существует'}), 400

    hashed_password = generate_password_hash(password)

    try:
        new_user = User(first_name=first_name, last_name=last_name, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        
        return jsonify({
            'message': 'Пользователь успешно зарегистрирован',
            'user': {
                'id': new_user.id,
                'first_name': new_user.first_name,
                'last_name': new_user.last_name,
                'email': new_user.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Ошибка при регистрации: ' + str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    remember = data.get('remember', False)

    if not email or not password:
        return jsonify({'error': 'Электронная почта и пароль обязательны для входа'}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        login_user(user, remember=remember)
        return jsonify({
            'message': 'Вход выполнен успешно',
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }
        }), 200
    else:
        return jsonify({'error': 'Неверная электронная почта или пароль'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Вы успешно вышли из системы'}), 200

@auth_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({
        'user': {
            'id': current_user.id,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'email': current_user.email
        }
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email обязателен"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Пользователь с таким email не найден"}), 404

    reset_code = str(random.randint(100000, 999999))

    PasswordReset.query.filter_by(user_id=user.id).delete()
    
    password_reset = PasswordReset(user_id=user.id, reset_code=reset_code)
    db.session.add(password_reset)
    db.session.commit()

    try:
        send_password_reset_email(user.email, reset_code)
        return jsonify({"message": "Код для сброса пароля отправлен на вашу почту"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ошибка при отправке email: {str(e)}"}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')

    if not all([email, code, new_password]):
        return jsonify({"error": "Заполните все поля"}), 400

    if len(new_password) < 8:
        return jsonify({"error": "Пароль должен содержать минимум 8 символов"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    reset_record = PasswordReset.query.filter_by(user_id=user.id, reset_code=code).first()

    if not reset_record:
        return jsonify({"error": "Неверный код сброса пароля"}), 400

    if datetime.utcnow() - reset_record.created_at > timedelta(minutes=5):
        return jsonify({"error": "Код сброса пароля истек"}), 400

    try:
        user.password_hash = generate_password_hash(new_password)
        db.session.delete(reset_record)
        
        expired_codes = PasswordReset.query.filter(
            PasswordReset.created_at < datetime.utcnow() - timedelta(minutes=5)
        ).all()
        
        for expired_code in expired_codes:
            db.session.delete(expired_code)
        
        db.session.commit()
        
        login_user(user)
        
        return jsonify({
            "message": "Пароль успешно обновлён",
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ошибка при обновлении пароля: {str(e)}"}), 500
    
@auth_bp.route('/check-session', methods=['GET'])
def check_session():
    """Check if user is authenticated without requiring login"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'email': current_user.email
            }
        }), 200
    return jsonify({'authenticated': False}), 200