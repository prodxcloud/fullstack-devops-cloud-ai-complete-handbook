from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_order_confirmation(email, product_id):
    subject = f"Order Confirmation for Product #{product_id}"
    message = "Thank you for your order! Your product is being processed."
    from_email = 'noreply@myshop.com'
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)