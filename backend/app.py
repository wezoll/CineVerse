from flask import Flask
from extensions import db, mail
from dotenv import load_dotenv
from flask_cors import CORS
from routes.auth_routes import auth_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config.from_object('config.Config')

db.init_app(app)
mail.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True)
