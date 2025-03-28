# Generated by Django 5.0.1 on 2025-02-22 08:59

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='billingaddress',
            name='user',
        ),
        migrations.RemoveField(
            model_name='order',
            name='shipping_address',
        ),
        migrations.RemoveField(
            model_name='order',
            name='billing_address',
        ),
        migrations.RemoveField(
            model_name='item',
            name='category',
        ),
        migrations.RemoveField(
            model_name='order',
            name='coupon',
        ),
        migrations.RemoveField(
            model_name='orderitem',
            name='item',
        ),
        migrations.RemoveField(
            model_name='order',
            name='items',
        ),
        migrations.RemoveField(
            model_name='order',
            name='payment',
        ),
        migrations.RemoveField(
            model_name='order',
            name='user',
        ),
        migrations.RemoveField(
            model_name='refund',
            name='order',
        ),
        migrations.RemoveField(
            model_name='orderitem',
            name='user',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='user',
        ),
        migrations.RemoveField(
            model_name='paymenthistory',
            name='product',
        ),
        migrations.RemoveField(
            model_name='price',
            name='product',
        ),
        migrations.DeleteModel(
            name='Slide',
        ),
        migrations.RemoveField(
            model_name='producttag',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='producttag',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='product',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='url',
            field=models.URLField(help_text='For external reference, e.g. Stripe product ID'),
        ),
        migrations.AlterField(
            model_name='producttag',
            name='name',
            field=models.CharField(max_length=50),
        ),
        migrations.DeleteModel(
            name='BillingAddress',
        ),
        migrations.DeleteModel(
            name='Category',
        ),
        migrations.DeleteModel(
            name='Coupon',
        ),
        migrations.DeleteModel(
            name='Item',
        ),
        migrations.DeleteModel(
            name='Order',
        ),
        migrations.DeleteModel(
            name='Refund',
        ),
        migrations.DeleteModel(
            name='OrderItem',
        ),
        migrations.DeleteModel(
            name='Payment',
        ),
        migrations.DeleteModel(
            name='PaymentHistory',
        ),
        migrations.DeleteModel(
            name='Price',
        ),
    ]
