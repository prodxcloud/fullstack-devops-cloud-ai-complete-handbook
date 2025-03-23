# apps/users/adapter.py

from allauth.account.adapter import DefaultAccountAdapter

class MyAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Customize the login redirect URL if needed.
        return "/"
