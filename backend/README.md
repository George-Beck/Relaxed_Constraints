# Research Portfolio Backend API

A Node.js/Express backend API for the Research Portfolio application with SQLite database persistence.

## 🚀 Features

- **RESTful API** for articles, stocks, economic indicators, and books
- **SQLite Database** with automatic schema initialization
- **JWT Authentication** for admin access
- **CORS Support** for frontend integration
- **Data Persistence** - all changes are saved to the database
- **Production Ready** with environment variable configuration

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout

### Articles
- `GET /api/articles` - Get all articles (with optional category/search filters)
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article (admin only)
- `PUT /api/articles/:id` - Update article (admin only)
- `DELETE /api/articles/:id` - Delete article (admin only)

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get single stock
- `POST /api/stocks` - Create stock (admin only)
- `PUT /api/stocks/:id` - Update stock (admin only)
- `DELETE /api/stocks/:id` - Delete stock (admin only)

### Economic Indicators
- `GET /api/indicators` - Get all indicators
- `GET /api/indicators/:id` - Get single indicator
- `POST /api/indicators` - Create indicator (admin only)
- `PUT /api/indicators/:id` - Update indicator (admin only)
- `DELETE /api/indicators/:id` - Delete indicator (admin only)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Health Check
- `GET /api/health` - API health status

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5174
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   DB_PATH=./database/research_portfolio.db
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 🗄️ Database

The API uses SQLite for data persistence. The database is automatically initialized with:

- **Articles Table**: Stores research articles with categories, tags, and content
- **Stocks Table**: Stock coverage data with symbols, prices, and ratings
- **Indicators Table**: Economic indicators with values and dates
- **Books Table**: Bookshelf with titles, authors, and cover images
- **Admin Users Table**: User authentication (currently uses hardcoded admin)

### Database Location
- Development: `./database/research_portfolio.db`
- The database file is created automatically on first run

### Sample Data
The database is seeded with sample data on initialization:
- 2 sample articles (Market Research & Economic Indicators)
- 4 sample stocks (AAPL, MSFT, GOOGL, AMZN)
- 4 sample economic indicators (GDP, Unemployment, CPI, Fed Rate)
- 3 sample books with cover images

## 🔐 Authentication

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### JWT Tokens
- Tokens expire after 24 hours
- Include `Authorization: Bearer <token>` header for protected routes
- Tokens are automatically verified on frontend

## 🌐 CORS Configuration

The API is configured to accept requests from:
- Development: `http://localhost:5174` (Vite dev server)
- Production: Set `FRONTEND_URL` environment variable

## 📦 Production Deployment

### Environment Variables
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your-super-secure-jwt-secret-key
DB_PATH=/path/to/production/database.db
```

### Deployment Options
1. **Traditional VPS**: Upload files and run `npm start`
2. **Docker**: Create Dockerfile and deploy to container platform
3. **Cloud Platforms**: Deploy to Heroku, Railway, DigitalOcean, etc.

### Database Backup
```bash
# Backup SQLite database
cp database/research_portfolio.db backup/research_portfolio_$(date +%Y%m%d).db
```

## 🔧 Development

### Project Structure
```
backend/
├── database/
│   ├── db.js              # Database connection and initialization
│   └── research_portfolio.db  # SQLite database file
├── routes/
│   ├── articles.js        # Article endpoints
│   ├── stocks.js          # Stock endpoints
│   ├── indicators.js      # Indicator endpoints
│   ├── books.js          # Book endpoints
│   └── auth.js           # Authentication endpoints
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── server.js             # Main server file
├── init-db.js            # Database initialization script
└── package.json
```

### Adding New Endpoints
1. Create route file in `routes/` directory
2. Add route to `server.js`
3. Update frontend API service

### Database Schema Changes
1. Modify table creation in `database/db.js`
2. Update seed data if needed
3. Test with fresh database

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database Locked**
```bash
# Restart server to release database lock
npm run dev
```

**CORS Errors**
- Check `FRONTEND_URL` environment variable
- Ensure frontend is running on correct port

**Authentication Issues**
- Verify JWT secret is set
- Check token expiration (24 hours)
- Clear browser localStorage if needed

## 📊 API Testing

### Using curl
```bash
# Health check
curl http://localhost:3001/api/health

# Get articles
curl http://localhost:3001/api/articles

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Using Postman
Import the API endpoints and test with the collection.

## 🔄 Data Flow

1. **Frontend** makes API requests to backend
2. **Backend** validates authentication (for admin routes)
3. **Database** stores/retrieves data
4. **Response** sent back to frontend
5. **Frontend** updates UI with new data

## 🚀 Next Steps

- [ ] Add user registration system
- [ ] Implement role-based permissions
- [ ] Add data validation middleware
- [ ] Create API documentation with Swagger
- [ ] Add database migrations system
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Set up automated backups
