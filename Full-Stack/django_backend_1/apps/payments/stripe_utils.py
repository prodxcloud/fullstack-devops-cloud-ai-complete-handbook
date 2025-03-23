# apps/payments/stripe_utils.py

import stripe
import traceback
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_link(price_id, order_id):
    """
    Create a Stripe Payment Link for a given price ID and order ID.
    """
    try:
        # Verify price exists
        price = stripe.Price.retrieve(price_id)
        print(f"Using price: {price.id} ({price.unit_amount/100} {price.currency.upper()})")

        # Create the payment link with redirect after completion (success page)
        payment_link = stripe.PaymentLink.create(
            line_items=[{"price": price_id, "quantity": 1}],
            after_completion={
                "type": "redirect",
                "redirect": {"url": f"http://127.0.0.1:8585/api/v1/payments/order/{order_id}/success"}
            },
            metadata={"order_id": order_id},
            idempotency_key=f"order_{order_id}_{price_id}"
        )

        print(f"Created PaymentLink: {payment_link}")
        return payment_link.url

    except stripe.error.StripeError as e:
        print(f"Stripe API Error: {e.error}")
        print(f"HTTP Status: {e.http_status}")
        print(f"Request ID: {e.request_id}")
        return None
    except Exception as e:
        print(f"Unexpected error: {traceback.format_exc()}")
        return None
