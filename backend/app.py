from flask import Flask
from extensions import db, mail, login_manager
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import timedelta


from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.faq import faq_bp
from routes.movies import movies_bp
from routes.reviews import reviews_bp
from routes.tv import tv_bp
from routes.search import search_bp
from routes.trending import trending_bp
from routes.releases import releases_bp
from routes.favorite import favorites_bp
from routes.admin import admin_bp
from models.user import User

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.config.from_object("config.Config")
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=1)


db.init_app(app)
mail.init_app(app)
login_manager.init_app(app)
login_manager.session_protection = "strong"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(profile_bp, url_prefix="/profile")
app.register_blueprint(faq_bp, url_prefix="/api/faq")
app.register_blueprint(movies_bp, url_prefix="/api/movies")
app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
app.register_blueprint(tv_bp, url_prefix="/api/tv")
app.register_blueprint(search_bp, url_prefix="/api/search")
app.register_blueprint(trending_bp, url_prefix='/api/trending')
app.register_blueprint(releases_bp, url_prefix='/api/releases')
app.register_blueprint(favorites_bp)
app.register_blueprint(admin_bp, url_prefix='/api/admin')
if __name__ == "__main__":
    app.run(debug=True)