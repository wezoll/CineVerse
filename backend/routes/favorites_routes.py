from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models.favorite import Favorite
import requests
from config import TMDB_API_KEY

favorites_bp = Blueprint('favorites', __name__)

# Получить список избранного для текущего пользователя
@favorites_bp.route('/api/favorites', methods=['GET'])
@login_required
def get_favorites():
    item_type = request.args.get('type')
    
    # Базовый запрос
    query = Favorite.query.filter_by(user_id=current_user.id)
    
    # Фильтрация по типу, если указан
    if item_type:
        query = query.filter_by(item_type=item_type)
    
    favorites = query.all()
    
    # Соберем детали из TMDB API для каждого избранного элемента
    result = []
    for fav in favorites:
        item_details = get_item_details_from_tmdb(fav.item_id, fav.item_type)
        if item_details:
            item_details['favorite_id'] = fav.id
            item_details['item_type'] = fav.item_type
            result.append(item_details)
    
    return jsonify({'favorites': result})

# Добавить элемент в избранное
@favorites_bp.route('/api/favorites', methods=['POST'])
@login_required
def add_favorite():
    data = request.get_json()
    
    if not data or 'item_id' not in data or 'item_type' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    # Проверяем, существует ли уже такой элемент в избранном
    existing = Favorite.query.filter_by(
        user_id=current_user.id, 
        item_id=data['item_id'], 
        item_type=data['item_type']
    ).first()
    
    if existing:
        return jsonify({'message': 'Item already in favorites', 'favorite': existing.to_dict()}), 200
    
    # Проверяем, существует ли элемент в TMDB
    if not validate_tmdb_item(data['item_id'], data['item_type']):
        return jsonify({'error': 'Invalid item_id or item_type'}), 400
    
    # Создаем новую запись в избранном
    new_favorite = Favorite(
        user_id=current_user.id,
        item_id=data['item_id'],
        item_type=data['item_type']
    )
    
    db.session.add(new_favorite)
    db.session.commit()
    
    return jsonify({'message': 'Added to favorites', 'favorite': new_favorite.to_dict()}), 201

# Удалить элемент из избранного
@favorites_bp.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
@login_required
def remove_favorite(favorite_id):
    favorite = Favorite.query.filter_by(id=favorite_id, user_id=current_user.id).first()
    
    if not favorite:
        return jsonify({'error': 'Favorite not found'}), 404
    
    db.session.delete(favorite)
    db.session.commit()
    
    return jsonify({'message': 'Removed from favorites'}), 200

# Проверить, находится ли элемент в избранном
@favorites_bp.route('/api/favorites/check', methods=['GET'])
@login_required
def check_favorite():
    item_id = request.args.get('item_id')
    item_type = request.args.get('item_type')
    
    if not item_id or not item_type:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    favorite = Favorite.query.filter_by(
        user_id=current_user.id, 
        item_id=int(item_id), 
        item_type=item_type
    ).first()
    
    if favorite:
        return jsonify({'is_favorite': True, 'favorite_id': favorite.id})
    else:
        return jsonify({'is_favorite': False})

# Вспомогательные функции
def validate_tmdb_item(item_id, item_type):
    """Проверяет, существует ли элемент в TMDB API"""
    valid_types = ['movie', 'tv', 'person']
    if item_type not in valid_types:
        return False
    
    url = f"https://api.themoviedb.org/3/{item_type}/{item_id}"
    params = {'api_key': TMDB_API_KEY}
    
    response = requests.get(url, params=params)
    return response.status_code == 200

def get_item_details_from_tmdb(item_id, item_type):
    """Получает детали элемента из TMDB API"""
    url = f"https://api.themoviedb.org/3/{item_type}/{item_id}"
    params = {'api_key': TMDB_API_KEY}
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return None