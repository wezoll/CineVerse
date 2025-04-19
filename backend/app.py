from flask import Flask
from extensions import db, mail, login_manager
from dotenv import load_dotenv
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.profile_routes import profile_bp

from models.user import User

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"]) 

app.config.from_object('config.Config')


db.init_app(app)
mail.init_app(app)
login_manager.init_app(app)
login_manager.session_protection = "strong"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(profile_bp, url_prefix='/profile')

if __name__ == '__main__':
    app.run(debug=True)