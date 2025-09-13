# Research Portfolio

A retro terminal-themed research portfolio application with modern web interface and admin dashboard.

## Features

- 🖥️ Retro terminal interface
- 📊 Market research and stock coverage
- 📈 Economic indicators tracking
- 📚 Virtual bookshelf
- 🔐 Admin authentication
- ✏️ Full CRUD operations for all content

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Authentication**: JWT tokens
- **Deployment**: Vercel (recommended)

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your JWT_SECRET
   ```

3. **Start development servers**:
   ```bash
   ./start-dev.sh
   # Or manually:
   # Backend: cd backend && npm run dev
   # Frontend: npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Deployment to Vercel (Free)

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/research-portfolio.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `JWT_SECRET` = your-secret-key

4. **Custom Domain** (Optional):
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Alternative Free Hosting Options

- **Netlify**: Similar to Vercel, supports serverless functions
- **Render**: Good for full-stack apps with databases
- **Railway**: $5/month after free trial, excellent for Node.js

## Admin Access

- **Username**: admin
- **Password**: admin123

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   └── types/          # TypeScript types
├── backend/
│   ├── routes/         # API routes
│   ├── database/       # Database setup
│   └── middleware/     # Express middleware
└── public/             # Static assets
```

## License

MIT License
