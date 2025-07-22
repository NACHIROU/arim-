import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

async def send_email(to_email: str, subject: str, html_content: str):
    """
    Envoie un email en utilisant le serveur SMTP de Gmail.
    """
    if not SENDER_EMAIL or not GMAIL_APP_PASSWORD:
        print("ERREUR : Les variables d'environnement pour l'email ne sont pas configurées.")
        return

    # Création du message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_email
    
    # On attache le contenu HTML
    part = MIMEText(html_content, 'html')
    msg.attach(part)

    try:
        # Connexion au serveur SMTP de Gmail
        print(f"Tentative d'envoi d'email à {to_email}...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() # Sécurisation de la connexion
        server.login(SENDER_EMAIL, GMAIL_APP_PASSWORD)
        
        # Envoi de l'email
        server.send_message(msg)
        
        server.quit()
        print(f"Email envoyé avec Succès ✅  à {to_email}.")
    except Exception as e:
        print(f"Échec de l'envoi de l'email : {e}")