from flask import Blueprint, jsonify, request
import requests
from config import Config

tv_bp = Blueprint('tv', __name__)

BASE_URL = "https://api.themoviedb.org/3"
API_KEY = Config.TMDB_API_KEY
LANGUAGE = "ru-RU"

@tv_bp.route('/popular-series', methods=['GET'])
def get_popular_tv_shows():
    page = request.args.get('page', 1)
    
    url = f"{BASE_URL}/tv/popular"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'page': page
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)

@tv_bp.route('/<int:tv_id>', methods=['GET'])
def get_tv_details(tv_id):
    extended = request.args.get('extended', 'false').lower() == 'true'
    
    url = f"{BASE_URL}/tv/{tv_id}"
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

@tv_bp.route('/<int:tv_id>/videos', methods=['GET'])
def get_tv_videos(tv_id):
    language = request.args.get('language', LANGUAGE)
    
    url = f"{BASE_URL}/tv/{tv_id}/videos"
    params = {
        'api_key': API_KEY,
        'language': language
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if len(data.get('results', [])) == 0 and language == LANGUAGE:
        params['language'] = 'en-US'
        response = requests.get(url, params=params)
        data = response.json()
    
    return jsonify(data)

@tv_bp.route('/<int:tv_id>/images', methods=['GET'])
def get_tv_images(tv_id):
    url = f"{BASE_URL}/tv/{tv_id}/images"
    params = {
        'api_key': API_KEY,
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)

@tv_bp.route('/search', methods=['GET'])
def search_tv_shows():
    query = request.args.get('query', '')
    page = request.args.get('page', 1)
    
    if not query:
        return jsonify({'results': [], 'total_pages': 0})
    
    url = f"{BASE_URL}/search/tv"
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'query': query,
        'page': page,
        'include_adult': False
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return jsonify(data)