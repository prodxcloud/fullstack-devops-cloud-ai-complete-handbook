from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import WalletBalance

@admin.register(WalletBalance)
class WalletBalanceAdmin(admin.ModelAdmin):
    list_display = ('wallet_address', 'balance_eth', 'balance_usd', 'last_updated')
    search_fields = ('wallet_address',)
