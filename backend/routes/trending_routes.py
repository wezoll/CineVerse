from flask import Blueprint, jsonify, request
import requests
from config import Config

trending_bp = Blueprint('trending', __name__)

BASE_URL = "https://api.themoviedb.org/3"
API_KEY = Config.TMDB_API_KEY
LANGUAGE = "ru-RU"

@trending_bp.route('/top10', methods=['GET'])
def get_trending_items():
    time_window = request.args.get('time_window', 'week')
    media_type = request.args.get('media_type', 'all')
    limit = request.args.get('limit', 10, type=int)
    
    url = f"{BASE_URL}/trending/{media_type}/{time_window}"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if 'results' in data:
        data['results'] = data['results'][:limit]
    
    return jsonify(data)

@trending_bp.route('/trending-movies', methods=['GET'])
def get_trending_movies():
    time_window = request.args.get('time_window', 'week')
    limit = request.args.get('limit', 10, type=int)
    
    url = f"{BASE_URL}/trending/movie/{time_window}"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if 'results' in data:
        data['results'] = data['results'][:limit]
    
    return jsonify(data)

@trending_bp.route('/trending-tv', methods=['GET'])
def get_trending_tv():
    time_window = request.args.get('time_window', 'week')
    limit = request.args.get('limit', 10, type=int)
    
    url = f"{BASE_URL}/trending/tv/{time_window}"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if 'results' in data:
        data['results'] = data['results'][:limit]
    
    return jsonify(data)