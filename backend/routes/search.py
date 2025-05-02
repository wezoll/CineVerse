from flask import Blueprint, jsonify, request
import requests
import asyncio
import aiohttp
from config import Config
from models.hidden_content import HiddenContent
from extensions import db

search_bp = Blueprint('search', __name__)

BASE_URL = "https://api.themoviedb.org/3"
API_KEY = Config.TMDB_API_KEY
LANGUAGE = "ru-RU"

@search_bp.route('/combined', methods=['GET'])
def combined_search():
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    
    if not query:
        return jsonify({'results': [], 'total_pages': 0})
    
    # Параметры для запросов к TMDB API
    params = {
        'api_key': API_KEY,
        'language': LANGUAGE,
        'query': query,
        'page': page,
        'include_adult': False
    }
    
    # Делаем запросы параллельно
    movies_url = f"{BASE_URL}/search/movie"
    tv_url = f"{BASE_URL}/search/tv"
    
    # Выполнение запросов
    movies_response = requests.get(movies_url, params=params)
    tv_response = requests.get(tv_url, params=params)
    
    movies_data = movies_response.json()
    tv_data = tv_response.json()
    
    # Получаем список скрытого контента
    hidden_content = HiddenContent.query.all()
    hidden_items = {(item.item_type, item.item_id) for item in hidden_content}
    
    # Добавляем тип медиа к каждому результату и фильтруем скрытый контент
    filtered_movies = []
    for item in movies_data.get('results', []):
        item['media_type'] = 'movie'
        if ('movie', item['id']) not in hidden_items:
            filtered_movies.append(item)
    
    filtered_tv = []
    for item in tv_data.get('results', []):
        item['media_type'] = 'series'
        # Переименовываем поля для совместимости с интерфейсом фильмов
        if 'name' in item:
            item['title'] = item['name']
        if 'first_air_date' in item:
            item['release_date'] = item['first_air_date']
        if ('tv', item['id']) not in hidden_items:
            filtered_tv.append(item)
    
    # Объединяем отфильтрованные результаты
    combined_results = filtered_movies + filtered_tv
    
    # Сортируем по популярности (если доступно) или по рейтингу
    combined_results.sort(key=lambda x: (x.get('popularity', 0) or 0), reverse=True)
    
    # Расчет общего количества страниц
    total_pages = max(movies_data.get('total_pages', 0), tv_data.get('total_pages', 0))
    
    return jsonify({
        'results': combined_results,
        'total_pages': total_pages if total_pages <= 500 else 500,
        'total_results': len(combined_results)
    })