from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.password_reset import PasswordReset
from werkzeug.security import generate_password_hash, check_password_hash
from utils.email_utils import send_password_reset_email
import random
from datetime import datetime, timedelta

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

    hashed_password = generate_password_hash(password)

    try:
        new_user = User(first_name=first_name, last_name=last_name, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Пользователь успешно зарегистрирован'}), 201
    except Exception as e:
        return jsonify({'error': 'Ошибка при регистрации: ' + str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Электронная почта и пароль обязательны для входа'}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Вход выполнен успешно'}), 200
    else:
        return jsonify({'error': 'Неверная электронная почта или пароль'}), 401

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email обязателен"}), 400

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar()

    if not user:
        return jsonify({"error": "Пользователь с таким email не найден"}), 404

    reset_code = str(random.randint(100000, 999999))

    password_reset = PasswordReset(user_id=user.id, reset_code=reset_code)
    db.session.add(password_reset)
    db.session.commit()

    send_password_reset_email(user.email, reset_code)

    return jsonify({"message": "Код для сброса пароля отправлен на вашу почту"}), 200

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

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar()

    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    reset_record = db.session.execute(
        db.select(PasswordReset).filter_by(user_id=user.id, reset_code=code)
    ).scalar()

    if not reset_record:
        return jsonify({"error": "Неверный код сброса пароля"}), 400

    if datetime.utcnow() - reset_record.created_at > timedelta(minutes=5):
        return jsonify({"error": "Код сброса пароля истек"}), 400

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    db.session.delete(reset_record)
    db.session.commit()

    expired_codes = db.session.execute(
        db.select(PasswordReset).filter(PasswordReset.created_at < datetime.utcnow() - timedelta(minutes=5))
    ).scalars().all()

    for expired_code in expired_codes:
        db.session.delete(expired_code)
    
    db.session.commit()

    return jsonify({"message": "Пароль успешно обновлён"}), 200
