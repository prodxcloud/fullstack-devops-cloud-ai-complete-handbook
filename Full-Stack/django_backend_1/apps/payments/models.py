from django.db import models

class WalletBalance(models.Model):
    wallet_address = models.CharField(max_length=42, unique=True)
    balance_eth = models.FloatField()
    balance_usd = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.wallet_address} - {self.balance_eth} ETH"
