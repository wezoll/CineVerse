from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models.user import User
from models.faq import FAQ
from models.review import Review
from models.hidden_content import HiddenContent
from functools import wraps
import requests
from config import Config

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Доступ запрещен. Требуются права администратора'}), 403
        return f(*args, **kwargs)
    return decorated_function

def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'super_admin':
            return jsonify({'error': 'Доступ запрещен. Требуются права супер-администратора'}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/check-role', methods=['GET'])
@login_required
def check_role():
    """Проверка роли текущего пользователя"""
    if not current_user.is_authenticated:
        return jsonify({'role': None}), 200
    
    return jsonify({'role': current_user.role}), 200

# Маршруты для управления пользователями (доступны супер-админам и админам)
@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    """Получение списка всех пользователей (только для админов)"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Маршруты для управления ролями пользователей (доступны только супер-админам)
@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@login_required
@super_admin_required
def update_user_role(user_id):
    """Обновление роли пользователя (только для супер-админа)"""
    data = request.get_json()
    new_role = data.get('role')
    
    if not new_role or new_role not in ['user', 'admin', 'super_admin']:
        return jsonify({'error': 'Указана некорректная роль'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    
    # Запрет на изменение собственной роли супер-админом
    if user.id == current_user.id:
        return jsonify({'error': 'Вы не можете изменить собственную роль'}), 400
    
    user.role = new_role
    db.session.commit()
    
    return jsonify({
        'message': 'Роль пользователя успешно обновлена',
        'user': user.to_dict()
    }), 200

# Маршруты для управления FAQ (доступны админам)
@admin_bp.route('/faqs', methods=['GET'])
@login_required
@admin_required
def get_all_faqs():
    """Получение всех FAQ, включая неактивные"""
    faqs = FAQ.query.order_by(FAQ.order).all()
    return jsonify([faq.to_dict() for faq in faqs]), 200

@admin_bp.route('/faqs', methods=['POST'])
@login_required
@admin_required
def create_faq():
    """Создание нового FAQ"""
    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')
    order = data.get('order', 0)
    is_active = data.get('is_active', True)
    
    if not question or not answer:
        return jsonify({'error': 'Заголовок и ответ обязательны'}), 400
    
    new_faq = FAQ(
        question=question,
        answer=answer,
        order=order,
        is_active=is_active
    )
    
    db.session.add(new_faq)
    db.session.commit()
    
    return jsonify({
        'message': 'FAQ успешно создан',
        'faq': new_faq.to_dict()
    }), 201

@admin_bp.route('/faqs/<int:faq_id>', methods=['PUT'])
@login_required
@admin_required
def update_faq(faq_id):
    """Обновление FAQ"""
    faq = FAQ.query.get(faq_id)
    if not faq:
        return jsonify({'error': 'FAQ не найден'}), 404
    
    data = request.get_json()
    faq.question = data.get('question', faq.question)
    faq.answer = data.get('answer', faq.answer)
    faq.order = data.get('order', faq.order)
    faq.is_active = data.get('is_active', faq.is_active)
    
    db.session.commit()
    
    return jsonify({
        'message': 'FAQ успешно обновлен',
        'faq': faq.to_dict()
    }), 200

@admin_bp.route('/faqs/<int:faq_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_faq(faq_id):
    """Удаление FAQ"""
    faq = FAQ.query.get(faq_id)
    if not faq:
        return jsonify({'error': 'FAQ не найден'}), 404
    
    db.session.delete(faq)
    db.session.commit()
    
    return jsonify({
        'message': 'FAQ успешно удален'
    }), 200

# Маршруты для управления отзывами
@admin_bp.route('/reviews', methods=['GET'])
@login_required
@admin_required
def get_all_reviews():
    """Получение всех отзывов (с возможностью фильтрации)"""
    # Можно добавить параметры фильтрации по item_type, item_id и т.д.
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return jsonify([review.to_dict() for review in reviews]), 200

@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_review(review_id):
    """Удаление отзыва администратором"""
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Отзыв не найден'}), 404
    
    db.session.delete(review)
    db.session.commit()
    
    return jsonify({
        'message': 'Отзыв успешно удален'
    }), 200
    
# Маршруты для управления видимостью контента (скрытие фильмов/сериалов)
@admin_bp.route('/hidden-content', methods=['GET'])
@login_required
@admin_required
def get_hidden_content():
    """Получение списка скрытого контента"""
    hidden_items = HiddenContent.query.order_by(HiddenContent.created_at.desc()).all()
    return jsonify([item.to_dict() for item in hidden_items]), 200

@admin_bp.route('/hidden-content', methods=['POST'])
@login_required
@admin_required
def hide_content():
    """Скрытие фильма или сериала"""
    data = request.get_json()
    item_type = data.get('item_type')
    item_id = data.get('item_id')
    reason = data.get('reason')
    
    if not item_type or not item_id:
        return jsonify({'error': 'Тип и ID контента обязательны'}), 400
    
    if item_type not in ['movie', 'tv']:
        return jsonify({'error': 'Неверный тип контента. Допустимые значения: movie, tv'}), 400
    
    # Проверка, не скрыт ли уже этот контент
    existing = HiddenContent.query.filter_by(item_type=item_type, item_id=item_id).first()
    if existing:
        return jsonify({'error': 'Этот контент уже скрыт'}), 400
    
    hidden_item = HiddenContent(
        item_type=item_type,
        item_id=item_id,
        reason=reason,
        hidden_by=current_user.id
    )
    
    db.session.add(hidden_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Контент успешно скрыт',
        'hidden_item': hidden_item.to_dict()
    }), 201

@admin_bp.route('/hidden-content/<int:hidden_id>', methods=['DELETE'])
@login_required
@admin_required
def unhide_content(hidden_id):
    """Восстановление скрытого фильма или сериала"""
    hidden_item = HiddenContent.query.get(hidden_id)
    if not hidden_item:
        return jsonify({'error': 'Скрытый контент не найден'}), 404
    
    db.session.delete(hidden_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Контент успешно восстановлен'
    }), 200

@admin_bp.route('/statistics', methods=['GET'])
@login_required
@admin_required
def get_statistics():
    """Получение статистики для админ-панели"""
    try:
        # Получаем количество пользователей
        total_users = User.query.count()
        
        # Получаем количество FAQ
        total_faqs = FAQ.query.count()
        
        # Получаем количество отзывов
        total_reviews = Review.query.count()
        
        # Получаем количество скрытого контента
        hidden_content = HiddenContent.query.count()
        
        # Получаем количество фильмов и сериалов из TMDB API
        tmdb_base_url = "https://api.themoviedb.org/3"
        api_key = Config.TMDB_API_KEY
        
        # Получаем количество фильмов
        movies_response = requests.get(
            f"{tmdb_base_url}/movie/popular",
            params={"api_key": api_key, "language": "ru-RU"}
        )
        total_movies = movies_response.json().get("total_results", 0)
        
        # Получаем количество сериалов
        tv_response = requests.get(
            f"{tmdb_base_url}/tv/popular",
            params={"api_key": api_key, "language": "ru-RU"}
        )
        total_tv_shows = tv_response.json().get("total_results", 0)
        
        return jsonify({
            "totalUsers": total_users,
            "totalMovies": total_movies,
            "totalTvShows": total_tv_shows,
            "totalReviews": total_reviews,
            "totalFaqs": total_faqs,
            "hiddenContent": hidden_content
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Ошибка при получении статистики: {str(e)}"}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    """Удаление пользователя (доступно админам и супер-админам)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    
    # Запрет на удаление собственного аккаунта
    if user.id == current_user.id:
        return jsonify({'error': 'Вы не можете удалить свой аккаунт'}), 400
    
    # Супер-админ может удалить любого пользователя
    # Обычный админ не может удалить супер-админа
    if current_user.role != 'super_admin' and user.role == 'super_admin':
        return jsonify({'error': 'У вас нет прав для удаления супер-администратора'}), 403
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Пользователь успешно удален'
    }), 200 