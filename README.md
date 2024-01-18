# NitorAssessmentPortal

> NitorAssessmentPortal is an internal assessment portal for Nitor Infotech Pvt. Ltd.


# Table of contents

* Local application setup guide (One time setup)
  1. Clone the repository
  2. [Backend app setup steps](#backend-app-setup-steps)
  3. [Frontend app setup steps](#frontend-app-setup-steps)
  4. [Setup pre-commit hook](#setup-pre-commit-hook)
* [Running the application](#running-the-application)
* [Using postresql database for development](#using-postresql-database-for-development)
* [Generate entity relationship from models](#generate-entity-relationship-from-models)
* [References](#references)


## Backend App Setup Steps

1. Go to the cloned directory
2. Setup .venv
```
python3.10 -m venv .venv
```
3. Install system dependencies
```
sudo apt install libpq-dev python3-dev build-essential
```
4. Activate venv, install requirements and go inside project app directory
```
source .venv/bin/activate
pip install -r nitoronlinetestportal/requirements.txt
cd nitoronlinetestportal
```
5. Check and run migrations
```
./manage.py showmigrations
./manage.py migrate
```
6. Create superuser
```
./manage.py createsuperuser
```


## Frontend App Setup Steps

1. Go to the cloned directory
2. Setup node_modules using node version v14.21.3 & npm version 6.14.18
```
cd nitoronlinetestportal/static/
npm i
```


## Setup pre-commit hook

1. Go to the cloned directory
2. Activate venv if not already done
```
source .venv/bin/activate
```
2. Install the git hook script
```
pre-commit install
```
Validate if getting the result as `pre-commit installed at .git/hooks/pre-commit`

3. After this before every commit command, unit test will run automatically.
4. If you get error: `Executable pytest not found`, please check if virtual environment is activated or not.
5. [Read more on pre-commit](https://pre-commit.com/)


## Running the application

1. Go to the cloned directory
2. Activate venv if not already done and go to project app directory
```
source .venv/bin/activate
cd nitoronlinetestportal
```
3. Run backend server
```
./manage.py runserver
```
4. In a new shell, go to cloned directory
5. Go to static directory and run frontend server
```
cd nitoronlinetestportal/static/
npm run dev
```


## Using postresql database for development

1. Stop server if running
2. Download & install postgresql server locally, refer https://www.postgresql.org/download/ for installation instructions.
3. Connect to postgres database from shell or UI (or use command `psql postgres` on freshly install postgres server) and create database and user as per DATABASE configuration in nitoronlinetestportal/settings.py file.
```
-- create database
create database db_name_here;

-- create user
create user username_here with encrypted password 'password_here';

-- grant db permission to user
grant all privileges on database db_name_here to username_here;
```
4. Apply migrations, create superuser and run server


## Generate entity relationship from models

1. After setting up the project, go to the cloned directory
2. Activate venv if not already done and go to project app directory
```
source .venv/bin/activate
cd nitoronlinetestportal
```
3. Run below command to generate a `.png` file
```
./manage.py runserver
manage.py graph_models -a -o models.png
```


## References
1. [Postman Collection for backend APIs](NitorAssessmentPortal.postman_collection.json)
