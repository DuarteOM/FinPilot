@echo off
title FinPilot Project Setup
color 0A

echo.
echo ===========================================
echo      Creating FinPilot Structure...
echo ===========================================
echo.

:: CLIENT
mkdir client\public

mkdir client\src\app

mkdir client\src\assets\fonts
mkdir client\src\assets\icons
mkdir client\src\assets\images
mkdir client\src\assets\illustrations
mkdir client\src\assets\logos

mkdir client\src\components\ui
mkdir client\src\components\layout
mkdir client\src\components\charts
mkdir client\src\components\cards
mkdir client\src\components\forms
mkdir client\src\components\tables
mkdir client\src\components\notifications
mkdir client\src\components\feedback
mkdir client\src\components\ai

mkdir client\src\features\dashboard
mkdir client\src\features\transactions
mkdir client\src\features\budgets
mkdir client\src\features\goals
mkdir client\src\features\subscriptions
mkdir client\src\features\investments
mkdir client\src\features\reports
mkdir client\src\features\accounts
mkdir client\src\features\ai
mkdir client\src\features\authentication
mkdir client\src\features\settings

mkdir client\src\hooks
mkdir client\src\context
mkdir client\src\services
mkdir client\src\api
mkdir client\src\lib
mkdir client\src\utils
mkdir client\src\constants
mkdir client\src\config
mkdir client\src\data
mkdir client\src\mocks
mkdir client\src\theme
mkdir client\src\styles
mkdir client\src\routes
mkdir client\src\types
mkdir client\src\tests

:: SERVER

mkdir server
mkdir server\src

mkdir server\src\config
mkdir server\src\controllers
mkdir server\src\middleware
mkdir server\src\routes
mkdir server\src\services
mkdir server\src\repositories
mkdir server\src\models
mkdir server\src\validators
mkdir server\src\utils
mkdir server\src\lib
mkdir server\src\jobs
mkdir server\src\sockets
mkdir server\src\ai
mkdir server\src\auth
mkdir server\src\notifications
mkdir server\src\uploads
mkdir server\src\tests

:: DATABASE

mkdir database
mkdir database\prisma
mkdir database\prisma\migrations
mkdir database\backups
mkdir database\diagrams

:: DOCS

mkdir docs
mkdir docs\api
mkdir docs\architecture
mkdir docs\database
mkdir docs\ui
mkdir docs\decisions

:: OTHER

mkdir scripts
mkdir shared
mkdir .github
mkdir .github\workflows

:: ROOT FILES

type nul > README.md
type nul > LICENSE
type nul > .env.example
type nul > docker-compose.yml

:: CLIENT FILES

type nul > client\src\app\App.jsx
type nul > client\src\app\main.jsx
type nul > client\src\app\router.jsx
type nul > client\src\app\providers.jsx

type nul > client\src\styles\globals.css

:: SERVER FILES

type nul > server\package.json
type nul > server\.env

type nul > server\src\app.js
type nul > server\src\server.js

:: DATABASE FILES

type nul > database\prisma\schema.prisma
type nul > database\prisma\seed.js

echo.
echo ===========================================
echo        FinPilot created successfully!
echo ===========================================
echo.

pause