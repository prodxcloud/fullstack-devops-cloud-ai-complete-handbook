import requests
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from web3 import Web3
from django.conf import settings
from .serializers import BuyBLPTokensSerializer  # Import the serializer
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.urls import reverse

import stripe
from .stripe_utils import create_payment_link

# Initialize Web3 instance using environment variable
web3 = Web3(Web3.HTTPProvider(settings.INFURA_URL))

# Ensure Stripe API key is set
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentViewSet(viewsets.ViewSet):
    """
    ViewSet for payment-related operations
    """
    permission_classes = [AllowAny]

    def list(self, request):
        """
        List all products from Stripe
        """
        try:
            # Retrieve all products from Stripe
            products = stripe.Product.list(active=True, limit=100)
            
            # Get prices for each product
            product_data = []
            for product in products.data:
                prices = stripe.Price.list(product=product.id, active=True)
                if prices.data:
                    product_data.append({
                        'id': product.id,
                        'name': product.name,
                        'description': product.description,
                        'image': product.images[0] if product.images else None,
                        'price': prices.data[0].unit_amount / 100,  # Convert cents to dollars
                        'currency': prices.data[0].currency,
                        'price_id': prices.data[0].id
                    })
            
            return Response({
                'products': product_data
            }, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None):
        """
        Retrieve a specific product from Stripe
        """
        try:
            # Retrieve the product from Stripe
            product = stripe.Product.retrieve(pk)
            prices = stripe.Price.list(product=pk, active=True)
            
            product_data = {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'image': product.images[0] if product.images else None,
                'prices': [{
                    'id': price.id,
                    'amount': price.unit_amount / 100,
                    'currency': price.currency
                } for price in prices.data]
            }
            
            return Response(product_data, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def create_payment(self, request, pk=None):
        """
        Create a payment session for a specific price
        """
        try:
            # Create a Stripe Checkout Session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': pk,
                    'quantity': 1,
                }],
                mode='payment',
                success_url=settings.STRIPE_SUCCESS_URL,
                cancel_url=settings.STRIPE_CANCEL_URL,
            )
            
            return Response({
                'sessionId': checkout_session.id,
                'url': checkout_session.url
            }, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def payment_success(self, request, pk=None):
        """
        Handle successful payment
        """
        return Response({
            'message': 'Payment successful',
            'order_id': pk
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def payment_failure(self, request, pk=None):
        """
        Handle failed payment
        """
        return Response({
            'message': 'Payment failed',
            'order_id': pk
        }, status=status.HTTP_400_BAD_REQUEST)

class CryptoViewSet(viewsets.ViewSet):
    """
    ViewSet for cryptocurrency-related operations
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def check_eth_balance(self, request):
        """
        Check ETH balance for a wallet address
        """
        wallet_address = request.query_params.get("wallet_address")
        if not wallet_address:
            return Response({"error": "Wallet address is required as a query parameter."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            balance_wei = web3.eth.get_balance(wallet_address)
            balance_eth = web3.from_wei(balance_wei, 'ether')
            response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
            eth_to_usd_rate = response.json()['ethereum']['usd']
            balance_usd = float(balance_eth) * eth_to_usd_rate

            return Response({
                "wallet_address": wallet_address,
                "balance_eth": float(balance_eth),
                "balance_usd": balance_usd,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def convert_btc_to_usd(self, request):
        """
        Convert BTC to USD
        """
        try:
            response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
            data = response.json()
            btc_to_usd = data['bitcoin']['usd']
            return Response({"btc_to_usd": btc_to_usd}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def check_btc_balance(self, request):
        """
        Check BTC balance for a wallet address
        """
        wallet_address = request.query_params.get("wallet_address")
        if not wallet_address:
            return Response({"error": "Wallet address is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(f"{settings.BTC_API_URL}/addressbalance/{wallet_address}")
            balance_satoshis = int(response.text)
            balance_btc = balance_satoshis / 1e8
            response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
            btc_to_usd_rate = response.json()['bitcoin']['usd']
            balance_usd = balance_btc * btc_to_usd_rate

            return Response({
                "wallet_address": wallet_address,
                "balance_btc": balance_btc,
                "balance_usd": balance_usd
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Minimal ABI for the BLP sale contract
BLP_SALE_ABI = [
    {
        "constant": False,
        "inputs": [],
        "name": "buyTokens",
        "outputs": [],
        "payable": True,
        "stateMutability": "payable",
        "type": "function"
    }
]

class BuyBLPTokensAPIView(APIView):
    """
    API View to buy BLP tokens via a smart contract.
    """

    def post(self, request):
        serializer = BuyBLPTokensSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        buyer_private_key = serializer.validated_data["private_key"]
        buyer_address = serializer.validated_data["buyer_address"]
        eth_amount = serializer.validated_data["eth_amount"]

        try:
            # Initialize Web3 connection using Infura
            web3 = Web3(Web3.HTTPProvider(settings.INFURA_URL))

            # Get the contract instance for the BLP sale contract
            contract_address = Web3.to_checksum_address(settings.BLP_SALE_CONTRACT_ADDRESS)
            contract = web3.eth.contract(address=contract_address, abi=BLP_SALE_ABI)

            # Get the buyer's nonce
            nonce = web3.eth.get_transaction_count(buyer_address)

            # Build the transaction to call buyTokens.
            tx = contract.functions.buyTokens().buildTransaction({
                'chainId': settings.CHAIN_ID,
                'gas': 200000,  # Adjust the gas limit as necessary
                'gasPrice': web3.toWei('5', 'gwei'),
                'nonce': nonce,
                'value': web3.toWei(float(eth_amount), 'ether'),
            })

            # Sign the transaction with the buyer's private key
            signed_tx = web3.eth.account.sign_transaction(tx, buyer_private_key)

            # Send the transaction to the network
            tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

            return Response({"tx_hash": web3.toHex(tx_hash)}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SendETHAPIView(APIView):
    """
    API View to send ETH based on the specified USD amount.
    """

    def post(self, request):
        """
        Handles POST requests to send ETH equivalent to the specified USD amount.
        Dynamically calculates ETH amount, gas fees, and ensures balance sufficiency.
        :param request: HTTP request with sender, recipient, private key, and amount in USD.
        :return: JSON response with transaction hash or an error message.
        """
        sender_private_key = request.data.get("private_key")
        sender_address = request.data.get("sender_address")
        recipient_address = request.data.get("recipient_address")
        amount_usd = request.data.get("amount_usd")  # USD amount specified in the request

        if not sender_private_key or not sender_address or not recipient_address or not amount_usd:
            return Response(
                {"error": "private_key, sender_address, recipient_address, and amount_usd are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Ensure the amount is a valid Decimal
            amount_usd = Decimal(amount_usd)

            # Define constants
            gas_limit = Decimal(21000)  # Standard gas limit for ETH transfer
            gas_price_gwei = Decimal(18.272286094)  # Gas price in Gwei
            # Fetch ETH to USD conversion rate
            response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
            eth_to_usd_rate = Decimal(response.json()['ethereum']['usd'])

            # Calculate ETH equivalent for the given USD amount
            amount_eth = amount_usd / eth_to_usd_rate

            # Calculate gas cost in ETH
            gas_cost_eth = (gas_price_gwei * gas_limit) / Decimal(1e9)  # Convert Gwei to ETH

            # Initialize Web3 connection
            web3 = Web3(Web3.HTTPProvider(settings.INFURA_URL))

            # Fetch sender's balance in ETH
            balance_wei = web3.eth.get_balance(sender_address)
            balance_eth = Decimal(web3.from_wei(balance_wei, 'ether'))

            # Ensure sufficient balance for transaction
            total_required_eth = amount_eth + gas_cost_eth
            if balance_eth < total_required_eth:
                return Response(
                    {
                        "error": f"Insufficient balance. Current balance: {float(balance_eth)} ETH, required: {float(total_required_eth)} ETH (including gas)."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create the transaction
            nonce = web3.eth.get_transaction_count(sender_address)
            tx = {
                'nonce': nonce,
                'to': recipient_address,
                'value': web3.to_wei(float(amount_eth), 'ether'),  # Amount to send in ETH
                'gas': int(gas_limit),
                'gasPrice': web3.to_wei(float(gas_price_gwei), 'gwei'),  # Gas price in Wei
            }

            # Sign and send the transaction
            signed_tx = web3.eth.account.sign_transaction(tx, sender_private_key)
            tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

            return Response({"tx_hash": web3.to_hex(tx_hash)}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException:
            return Response({"error": "Failed to fetch ETH to USD conversion rate."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)