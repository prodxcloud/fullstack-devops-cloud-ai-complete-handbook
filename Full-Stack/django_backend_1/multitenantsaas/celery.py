# celery.py
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitenantsaas.settings')

app = Celery('multitenantsaas')

# Using a string here means the worker does not have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Optional: A debug task to test celery:
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
