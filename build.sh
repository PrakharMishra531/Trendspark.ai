#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python trendanalyzer/manage.py collectstatic --no-input
python trendanalyzer/manage.py migrate
