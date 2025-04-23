## 🔐 Supabase Authentication API

A complete Node.js/Express authentication API using Supabase with:

### Key Features
- ✅ Email/password registration & login
- ✅ JWT token authentication
- ✅ Password reset via email
- ✅ User profile management (name, phone)
- ✅ Secure cookie-based sessions
- ✅ Role-based access control

### Tech Stack
- **Backend**: Node.js, Express
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Security**: JWT, HTTP-only cookies, rate limiting

### Endpoints
POST /api/auth/register # Register new user
POST /api/auth/login # Login user
POST /api/auth/refresh-token # Refresh access token
POST /api/auth/request-password-reset # Request password reset
POST /api/auth/reset-password # Complete password reset
GET /api/auth/me # Get current user (protected)
POST /api/auth/logout # Logout (protected)
PUT /api/auth/update-profile # Update profile (protected)
PUT /api/auth/update-password # Update password (protected)


### Environment Setup
1. Clone repo
2. `npm install`
3. Create `.env` file (see `.env.example`)
4. Set up Supabase tables (see `sql/schema.sql`)

### Configuration
```env
# Supabase
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=5000
CLIENT_URL=http://localhost:3000
COOKIE_SECRET=your-secret-key

npm run dev  # Start development server
npm test     # Run tests
