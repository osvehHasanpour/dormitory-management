# dormitory-management

# Dormitory Management System

## Requirements

* Git
* Docker Desktop

## Installation
git clone <repository>

cd dormitory-management

python3 -m venv .venv

source .venv/bin/activate

pip install -r backend/requirements.txt

docker-compose up -d
##
cd backend

python manage.py migrate

python manage.py runserver

##

cd frontend

npm install

npm run dev
