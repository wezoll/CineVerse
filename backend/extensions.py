from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_login import LoginManager
from mailjet_rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
mail = Mail()

login_manager = LoginManager()
login_manager.session_protection = "strong"

mailjet = Client(
    auth=(os.getenv("MAILJET_API_KEY"), os.getenv("MAILJET_SECRET_KEY")),
    version='v3.1'
)