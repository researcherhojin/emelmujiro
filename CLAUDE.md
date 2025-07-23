# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack corporate website with blog functionality, built with a decoupled architecture:

- **Backend**: Django 5.1.5 + Django REST Framework API
- **Frontend**: React 18.2.0 + Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (production ready)
- **Deployment**: Gunicorn + WhiteNoise ready

## Common Development Commands

### Backend (from `/backend` directory)

```bash
# Setup
conda create -n emel python=3.12
conda activate emel
pip install -r requirements.txt

# Database
python manage.py migrate
python manage.py createsuperuser

# Development
python manage.py runserver              # Run on http://localhost:8000
python manage.py shell                  # Django shell
python manage.py security_check         # Custom security audit

# Testing (no tests implemented yet)
python manage.py test

# Production deployment
./scripts/deploy.sh                     # Run deployment script
python manage.py collectstatic          # Collect static files
```

### Frontend (from `/frontend` directory)

```bash
# Setup
npm install

# Development
npm start                               # Run on http://localhost:3000

# Production
npm run build                           # Build for production

# Testing (no tests implemented yet)
npm test                                # Run Jest tests
```

## Architecture Overview

### API Structure
The backend provides a RESTful API with Django REST Framework:

- **Main API endpoint**: `/api/blog-posts/` - Full CRUD for blog posts
- **Admin panel**: `/admin/` - Django admin for content management
- **API Models**: Blog posts with title, content, author, timestamps
- **Security**: Rate limiting, CORS headers, security middleware

### Frontend Architecture
React SPA with component-based structure:

```
src/
├── components/
│   ├── blog/        # BlogList, BlogDetail, BlogPost components
│   ├── common/      # Shared components (cards, buttons)
│   ├── layout/      # Header, Footer, Layout wrapper
│   └── pages/       # Page-level components
├── services/        # API service layer (axios-based)
└── utils/           # Utility functions and constants
```

### Key Technical Details

1. **API Communication**: Frontend uses axios to communicate with Django REST API
2. **Routing**: React Router v6 for frontend, Django URLs for backend
3. **State Management**: Local React state (no Redux/Context API yet)
4. **Styling**: Tailwind CSS with responsive design
5. **SEO**: React Helmet for meta tags
6. **Security Features**:
   - Django rate limiting
   - CORS configuration
   - Security middleware options
   - reCAPTCHA support

### Environment Configuration

Backend requires `.env` file (see `env_example.txt`):
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection
- `CORS_ALLOWED_ORIGINS`: Frontend URLs
- Email and reCAPTCHA settings

### Development Workflow

1. **Backend First**: Start Django server before frontend
2. **API Development**: Use Django REST Framework browsable API
3. **Frontend Proxy**: React dev server proxies `/api` to Django (configured in package.json)
4. **Hot Reload**: Both frontend and backend support hot reloading

### Important Notes

- No test coverage currently exists - consider adding tests when implementing new features
- Production deployment uses Gunicorn and WhiteNoise for static files
- Database migrations must be run after model changes
- CORS settings must include frontend URL for API access
- Security check command available for auditing Django settings