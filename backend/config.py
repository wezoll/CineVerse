from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:123456@localhost:5432/cineverse'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAILJET_API_KEY = os.getenv("MAILJET_API_KEY")
    MAILJET_SECRET_KEY = os.getenv("MAILJET_SECRET_KEY")
    MAILJET_SENDER = "@gmail.com"
