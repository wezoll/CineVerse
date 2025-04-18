from mailjet_rest import Client
import os

MJ_APIKEY_PUBLIC = os.getenv('MAILJET_API_KEY')
MJ_APIKEY_PRIVATE = os.getenv('MAILJET_SECRET_KEY')

def send_password_reset_email(email, reset_code):
    mailjet = Client(auth=(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE), version='v3.1')
    
    message = {
        "Messages": [
            {
                "From": {
                    "Email": "cineverse.wwebsite@gmail.com",
                    "Name": "CineVerse"
                },
                "To": [{"Email": email}],
                "Subject": "Сброс пароля",
                "TextPart": f"Ваш код для сброса пароля: {reset_code}",
                "HTMLPart": f"<h3>Ваш код для сброса пароля:</h3><p>{reset_code}</p>"
            }
        ]
    }

    result = mailjet.send.create(data=message)
    print("Mailjet response:", result.status_code, result.text)

    if result.status_code != 200:
        raise Exception(f"Ошибка при отправке письма: {result.status_code} - {result.text}")
