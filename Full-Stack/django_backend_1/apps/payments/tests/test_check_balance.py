# import unittest
# from unittest.mock import patch, MagicMock
# from decimal import Decimal
# from rest_framework.test import APIRequestFactory, APITestCase
# from rest_framework import status
# from django.conf import settings
# from web3 import Web3

# # Import the view to test
# from apps.payments.views import SendETHAPIView


# class TestSendETHAPIView(APITestCase):
#     """
#     Unit tests for the SendETHAPIView.
#     """

#     @patch('web3.Web3.eth.get_balance')
#     @patch('web3.Web3.eth.get_transaction_count')
#     @patch('web3.Web3.eth.send_raw_transaction')
#     @patch('web3.Web3.eth.account.sign_transaction')
#     @patch('requests.get')
#     def test_eth_balance_sufficient(self, mock_get, mock_sign_transaction, mock_send_raw_transaction, mock_get_transaction_count, mock_get_balance):
#         """
#         Test case where the sender has sufficient balance to send $20 worth of ETH.
#         """
#         # Mock ETH to USD conversion API response
#         mock_get.return_value.json.return_value = {'ethereum': {'usd': 2000}}  # 1 ETH = $2000

#         # Mock Web3 methods
#         mock_get_balance.return_value = Web3.to_wei(0.02, 'ether')  # Sender has 0.02 ETH
#         mock_get_transaction_count.return_value = 5  # Nonce is 5
#         mock_sign_transaction.return_value.raw_transaction = b'signed_txn'  # Mock signed transaction
#         mock_send_raw_transaction.return_value = b'tx_hash'  # Mock transaction hash

#         # Prepare test request
#         factory = APIRequestFactory()
#         request = factory.post(
#             '/api/v1/payments/send-eth/',
#             {
#                 'private_key': 'mock_private_key',
#                 'sender_address': '0x62e57f69716F1e8D4140BdFdae68AA509dc0A477',
#                 'recipient_address': '0xF880A844b2EFFe3b2b254FC58a2aa559bA4A2eBF',
#                 'amount_usd': 20
#             },
#             format='json'
#         )

#         # Instantiate and call the view
#         view = SendETHAPIView.as_view()
#         response = view(request)

#         # Validate response
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertIn('tx_hash', response.data)

#     @patch('web3.Web3.eth.get_balance')
#     @patch('requests.get')
#     def test_eth_balance_insufficient(self, mock_get, mock_get_balance):
#         """
#         Test case where the sender has insufficient balance to send $20 worth of ETH.
#         """
#         # Mock ETH to USD conversion API response
#         mock_get.return_value.json.return_value = {'ethereum': {'usd': 2000}}  # 1 ETH = $2000

#         # Mock Web3 methods
#         mock_get_balance.return_value = Web3.to_wei(0.01, 'ether')  # Sender has 0.01 ETH (insufficient)

#         # Prepare test request
#         factory = APIRequestFactory()
#         request = factory.post(
#             '/api/v1/payments/send-eth/',
#             {
#                 'private_key': 'mock_private_key',
#                 'sender_address': '',
#                 'recipient_address': '',
#                 'amount_usd': 20
#             },
#             format='json'
#         )

#         # Instantiate and call the view
#         view = SendETHAPIView.as_view()
#         response = view(request)

#         # Validate response
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertIn('error', response.data)
#         self.assertIn('Insufficient balance', response.data['error'])


# if __name__ == '__main__':
#     unittest.main()
