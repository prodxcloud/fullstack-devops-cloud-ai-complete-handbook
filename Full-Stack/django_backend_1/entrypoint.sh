#!/usr/bin/env sh

# License: MIT
# Author: Joel Wembo
# Company: prodxcloud LLC
# Copyright (c) 2024 prodxcloud LLC. All rights reserved.

# Copyright (c) 2024 ProdxCloud. All rights reserved.
# This software is proprietary and confidential.
# Unauthorized copying of this file, via any medium is strictly prohibited.

python manage.py makemigrations

until python manage.py migrate
do
    echo "Waiting for db to be ready..."
    sleep 3
done

python manage.py collectstatic --noinput
python manage.py create_default_superuser
gunicorn multitenantsaas.wsgi --bind 0.0.0.0:8585 --workers 4 --threads 4
# for debug
# python manage.py runserver
# python manage.py runserver 0.0.0.0:8585

# For Docker 
docker-compose up --build --no-cache
docker run -p 8585:8585 -v $(pwd)/appdata:/appdata prodxcloud-backend-django