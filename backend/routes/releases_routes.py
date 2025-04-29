from flask import Blueprint, jsonify, request
import requests
import random
from config import Config

releases_bp = Blueprint('releases', __name__)

BASE_URL = "https://api.themoviedb.org/3"
API_KEY = Config.TMDB_API_KEY
LANGUAGE = "ru-RU"

sorted_results = None

@releases_bp.route('/new-movies', methods=['GET'])
def get_new_movies():
    global sorted_results
    page = request.args.get('page', 1)
    limit = int(request.args.get('limit', 20))
    
    if sorted_results is None:
        movies_url = f"{BASE_URL}/discover/movie"
        movies_params = {
            'api_key': API_KEY,
            'language': LANGUAGE,
            'page': page,
            'primary_release_date.gte': '2025-03-01',
            'primary_release_date.lte': '2025-04-30',
            'sort_by': 'popularity.desc'
        }
        
        tv_url = f"{BASE_URL}/discover/tv"
        tv_params = {
            'api_key': API_KEY,
            'language': LANGUAGE,
            'page': page,
            'first_air_date.gte': '2025-03-01',
            'first_air_date.lte': '2025-04-30',
            'sort_by': 'popularity.desc'
        }
        
        movies_response = requests.get(movies_url, params=movies_params)
        tv_response = requests.get(tv_url, params=tv_params)
        
        movies_data = movies_response.json()
        tv_data = tv_response.json()
        
        combined_results = []
        
        for movie in movies_data.get('results', []):
            movie['media_type'] = 'movie'
            combined_results.append(movie)
        
        for tv in tv_data.get('results', []):
            tv['media_type'] = 'tv'
            combined_results.append(tv)
        
        combined_results.sort(key=lambda x: x.get('release_date', x.get('first_air_date', '')))
        sorted_results = combined_results
    
    results = sorted_results[:limit]
    
    result = {
        'results': results,
        'page': int(page),
        'total_results': len(results),
        'total_pages': 1
    }
    
    return jsonify(result)

@releases_bp.route('/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'append_to_response': 'credits,videos,similar'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)

@releases_bp.route('/tv/<int:tv_id>', methods=['GET'])
def get_tv_details(tv_id):
    url = f"{BASE_URL}/tv/{tv_id}"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'append_to_response': 'credits,videos,similar'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)