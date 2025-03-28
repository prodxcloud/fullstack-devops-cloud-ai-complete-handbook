# Generated by Django 5.0.1 on 2024-11-17 17:32

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WalletBalance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('wallet_address', models.CharField(max_length=42, unique=True)),
                ('balance_eth', models.FloatField()),
                ('balance_usd', models.FloatField()),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
