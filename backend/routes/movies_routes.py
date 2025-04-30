from flask import Blueprint, jsonify, request
import requests
from config import Config
from models.hidden_content import HiddenContent
from extensions import db

movies_bp = Blueprint('movies', __name__)

BASE_URL = "https://api.themoviedb.org/3"
API_KEY = Config.TMDB_API_KEY
LANGUAGE = "ru-RU"

@movies_bp.route('/popular-movies', methods=['GET'])
def get_popular_movies():
    page = request.args.get('page', 1)
    
    url = f"{BASE_URL}/movie/popular"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'page': page
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    # Получаем список скрытых фильмов
    hidden_movies = HiddenContent.query.filter_by(item_type='movie').all()
    hidden_movie_ids = {item.item_id for item in hidden_movies}
    
    # Фильтруем скрытые фильмы из результатов
    if 'results' in data:
        data['results'] = [movie for movie in data['results'] if movie['id'] not in hidden_movie_ids]
    
    return jsonify(data)

@movies_bp.route('/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    # Проверяем, не скрыт ли фильм
    hidden_movie = HiddenContent.query.filter_by(item_type='movie', item_id=movie_id).first()
    if hidden_movie:
        return jsonify({'error': 'Фильм скрыт'}), 404
    
    extended = request.args.get('extended', 'false').lower() == 'true'
    
    url = f"{BASE_URL}/movie/{movie_id}"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE
    }
    
    if extended:
        params['append_to_response'] = 'credits,videos,similar,images'
    else:
        params['append_to_response'] = 'credits,videos,similar'
    
    response = requests.get(url, params=params)
    data = response.json()

    return jsonify(data)

@movies_bp.route('/<int:movie_id>/videos', methods=['GET'])
def get_movie_videos(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}/videos"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)

@movies_bp.route('/<int:movie_id>/images', methods=['GET'])
def get_movie_images(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}/images"
    params = {
        'api_key': API_KEY,
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)


@movies_bp.route('/search', methods=['GET'])
def search_movies():
    query = request.args.get('query', '')
    page = request.args.get('page', 1)
    
    if not query:
        return jsonify({'results': [], 'total_pages': 0})
    
    url = f"{BASE_URL}/search/movie"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'query': query,
        'page': page,
        'include_adult': False
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    # Получаем список скрытых фильмов
    hidden_movies = HiddenContent.query.filter_by(item_type='movie').all()
    hidden_movie_ids = {item.item_id for item in hidden_movies}
    
    # Фильтруем скрытые фильмы из результатов поиска
    if 'results' in data:
        data['results'] = [movie for movie in data['results'] if movie['id'] not in hidden_movie_ids]
    
    return jsonify(data)

@movies_bp.route('/discover', methods=['GET'])
def discover_movies():
    genre = request.args.get('genre', '')
    page = request.args.get('page', 1)
    
    url = f"{BASE_URL}/discover/movie"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'page': page,
        'sort_by': 'popularity.desc',
        'include_adult': False
    }
    
    if genre:
        params['with_genres'] = genre
    
    response = requests.get(url, params=params)
    data = response.json()
    
    # Получаем список скрытых фильмов
    hidden_movies = HiddenContent.query.filter_by(item_type='movie').all()
    hidden_movie_ids = {item.item_id for item in hidden_movies}
    
    # Фильтруем скрытые фильмы из результатов
    if 'results' in data:
        data['results'] = [movie for movie in data['results'] if movie['id'] not in hidden_movie_ids]
    
    return jsonify(data)