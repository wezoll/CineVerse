from flask import Blueprint, jsonify, request
from extensions import db
from models.review import Review
from models.user import User
import requests
from config import Config
from flask_login import login_required, current_user

reviews_bp = Blueprint('reviews', __name__)

BASE_URL = "https://api.themoviedb.org/3"
API_KEY = Config.TMDB_API_KEY
LANGUAGE = "ru-RU"

@reviews_bp.route('/movie/<int:movie_id>', methods=['GET'])
def get_movie_reviews(movie_id):
    """Получение всех отзывов для фильма (как с TMDB, так и локальных)"""
    try:
        local_reviews = Review.query.filter_by(movie_id=movie_id).all()
        local_reviews_data = [review.to_dict() for review in local_reviews]
        
        url = f"{BASE_URL}/movie/{movie_id}/reviews"
        params = {
            'api_key': API_KEY,
            'language': LANGUAGE
        }
        
        response = requests.get(url, params=params)
        tmdb_data = response.json()
        
        tmdb_reviews = []
        if 'results' in tmdb_data:
            for review in tmdb_data['results']:
                tmdb_reviews.append({
                    'id': review.get('id'),
                    'movie_id': movie_id,
                    'user_id': None,
                    'user_name': review.get('author', 'Неизвестный'),
                    'rating': review.get('author_details', {}).get('rating', 0),
                    'content': review.get('content', ''),
                    'created_at': review.get('created_at', '').split('T')[0],
                    'updated_at': review.get('updated_at', '').split('T')[0],
                    'source': 'tmdb',
                    'avatar_path': review.get('author_details', {}).get('avatar_path', '')
                })
        
        all_reviews = local_reviews_data + tmdb_reviews
        
        all_reviews.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'reviews': all_reviews,
            'total_count': len(all_reviews),
            'local_count': len(local_reviews_data),
            'tmdb_count': len(tmdb_reviews)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Ошибка при получении отзывов: {str(e)}'}), 500

@reviews_bp.route('/movie/<int:movie_id>', methods=['POST'])
@login_required
def create_review(movie_id):
    data = request.get_json()
    rating = data.get('rating')
    content = data.get('content', '')
    
    if not rating or not isinstance(rating, (int, float)) or rating < 0 or rating > 10:
        return jsonify({'error': 'Оценка должна быть числом от 0 до 10'}), 400
    
    existing_review = Review.query.filter_by(movie_id=movie_id, user_id=current_user.id).first()
    if existing_review:
        return jsonify({'error': 'Вы уже оставляли отзыв на этот фильм. Вы можете его отредактировать.'}), 400
    
    try:
        new_review = Review(
            movie_id=movie_id,
            user_id=current_user.id,
            rating=rating,
            content=content
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        return jsonify({
            'message': 'Отзыв успешно создан',
            'review': new_review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при создании отзыва: {str(e)}'}), 500

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@login_required
def update_review(review_id):
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Отзыв не найден'}), 404
    
    if review.user_id != current_user.id:
        return jsonify({'error': 'Вы можете редактировать только свои отзывы'}), 403
    
    data = request.get_json()
    rating = data.get('rating')
    content = data.get('content')
    
    if rating is not None and (not isinstance(rating, (int, float)) or rating < 0 or rating > 10):
        return jsonify({'error': 'Оценка должна быть числом от 0 до 10'}), 400
    
    try:
        if rating is not None:
            review.rating = rating
        
        if content is not None:
            review.content = content
        
        db.session.commit()
        
        return jsonify({
            'message': 'Отзыв успешно обновлен',
            'review': review.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при обновлении отзыва: {str(e)}'}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Отзыв не найден'}), 404
    
    if review.user_id != current_user.id:
        return jsonify({'error': 'Вы можете удалять только свои отзывы'}), 403
    
    try:
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Отзыв успешно удален'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при удалении отзыва: {str(e)}'}), 500

@reviews_bp.route('/user', methods=['GET'])
@login_required
def get_user_reviews():
    try:
        user_reviews = Review.query.filter_by(user_id=current_user.id).order_by(Review.created_at.desc()).all()
        reviews_data = [review.to_dict() for review in user_reviews]
        
        return jsonify({
            'reviews': reviews_data,
            'total_count': len(reviews_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Ошибка при получении отзывов: {str(e)}'}), 500
    
@reviews_bp.route('/tv/<int:series_id>', methods=['GET'])
def get_tv_reviews(series_id):
    try:
        local_reviews = Review.query.filter_by(series_id=series_id).all()
        local_reviews_data = [review.to_dict() for review in local_reviews]
        
        url = f"{BASE_URL}/tv/{series_id}/reviews"
        params = {
            'api_key': API_KEY,
            'language': LANGUAGE
        }
        
        response = requests.get(url, params=params)
        tmdb_data = response.json()
        
        tmdb_reviews = []
        if 'results' in tmdb_data:
            for review in tmdb_data['results']:
                tmdb_reviews.append({
                    'id': review.get('id'),
                    'series_id': series_id,
                    'user_id': None,
                    'user_name': review.get('author', 'Неизвестный'),
                    'rating': review.get('author_details', {}).get('rating', 0),
                    'content': review.get('content', ''),
                    'created_at': review.get('created_at', '').split('T')[0],
                    'updated_at': review.get('updated_at', '').split('T')[0],
                    'source': 'tmdb',
                    'avatar_path': review.get('author_details', {}).get('avatar_path', '')
                })
        
        all_reviews = local_reviews_data + tmdb_reviews
        
        all_reviews.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'reviews': all_reviews,
            'total_count': len(all_reviews),
            'local_count': len(local_reviews_data),
            'tmdb_count': len(tmdb_reviews)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Ошибка при получении отзывов: {str(e)}'}), 500

@reviews_bp.route('/tv/<int:series_id>', methods=['POST'])
@login_required
def create_tv_review(series_id):
    data = request.get_json()
    rating = data.get('rating')
    content = data.get('content', '')
    
    if not rating or not isinstance(rating, (int, float)) or rating < 0 or rating > 10:
        return jsonify({'error': 'Оценка должна быть числом от 0 до 10'}), 400
    
    existing_review = Review.query.filter_by(series_id=series_id, user_id=current_user.id).first()
    if existing_review:
        return jsonify({'error': 'Вы уже оставляли отзыв на этот сериал. Вы можете его отредактировать.'}), 400
    
    try:
        new_review = Review(
            series_id=series_id,
            user_id=current_user.id,
            rating=rating,
            content=content
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        return jsonify({
            'message': 'Отзыв успешно создан',
            'review': new_review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при создании отзыва: {str(e)}'}), 500