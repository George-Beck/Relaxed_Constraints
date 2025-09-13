const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
// In production (Vercel), use in-memory database since file system is read-only
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? ':memory:' : path.join(__dirname, 'research_portfolio.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`📊 Connected to SQLite database (${isProduction ? 'in-memory' : 'file'})`);
  }
});

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Articles table
      db.run(`
        CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          content TEXT NOT NULL,
          date TEXT NOT NULL,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Stocks table
      db.run(`
        CREATE TABLE IF NOT EXISTS stocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT UNIQUE NOT NULL,
          company_name TEXT NOT NULL,
          current_price REAL,
          target_price REAL,
          rating TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Economic indicators table
      db.run(`
        CREATE TABLE IF NOT EXISTS indicators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value REAL NOT NULL,
          unit TEXT,
          date TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Books table
      db.run(`
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          description TEXT,
          cover_image TEXT,
          rating INTEGER,
          status TEXT DEFAULT 'read',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized');
          resolve();
        }
      });
    });
  });
};

// Seed initial data
const seedInitialData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if we already have data
      db.get("SELECT COUNT(*) as count FROM articles", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          console.log('🌱 Seeding initial data...');
          
          // Insert sample articles
          const articles = [
            {
              id: 'mr001',
              title: 'Tech Sector Valuation Metrics in 2024',
              category: 'market-research',
              content: `# Tech Sector Valuation Metrics in 2024

## Executive Summary

The technology sector continues to trade at elevated valuations despite recent market corrections. This analysis examines key valuation metrics across major tech companies and identifies potential opportunities.

## Key Findings

**Price-to-Earnings Analysis**
- Median P/E ratio for large-cap tech: 28.5x
- Historical average (10-year): 22.1x
- Current premium: 29% above historical average

**Growth Considerations**
The elevated valuations may be justified by:
- Accelerating AI adoption across enterprise
- Cloud computing growth acceleration
- Digital transformation trends

## Investment Implications

**Overweight Positions**
- Cloud infrastructure providers
- AI/ML platform companies
- Cybersecurity leaders

**Underweight Positions**
- Legacy hardware manufacturers
- Traditional software vendors
- Consumer tech with limited moats`,
              date: '2024-01-15',
              tags: JSON.stringify(['technology', 'valuation', 'P/E ratios'])
            },
            {
              id: 'ei001',
              title: 'Federal Reserve Policy Impact Analysis',
              category: 'economic-indicators',
              content: `# Federal Reserve Policy Impact Analysis

## Current Policy Stance

The Federal Reserve has maintained a hawkish stance with continued rate hikes to combat inflation. This analysis examines the broader economic implications.

## Key Metrics

**Interest Rates**
- Federal Funds Rate: 5.25-5.50%
- 10-Year Treasury: 4.85%
- Real Interest Rate: 2.1%

**Economic Indicators**
- CPI: 3.2% YoY
- Unemployment: 3.8%
- GDP Growth: 2.1% Q3

## Market Implications

The current policy environment suggests:
- Continued pressure on growth stocks
- Value rotation potential
- Defensive positioning recommended`,
              date: '2024-01-10',
              tags: JSON.stringify(['federal reserve', 'interest rates', 'inflation'])
            }
          ];

          const insertArticle = db.prepare(`
            INSERT INTO articles (id, title, category, content, date, tags)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          articles.forEach(article => {
            insertArticle.run(
              article.id,
              article.title,
              article.category,
              article.content,
              article.date,
              article.tags
            );
          });

          insertArticle.finalize();

          // Insert sample stocks
          const stocks = [
            ['AAPL', 'Apple Inc.', 175.50, 200.00, 'BUY', 'Strong iPhone 15 cycle and services growth'],
            ['MSFT', 'Microsoft Corporation', 380.25, 420.00, 'BUY', 'Azure growth and AI integration'],
            ['GOOGL', 'Alphabet Inc.', 140.80, 160.00, 'BUY', 'Search dominance and cloud expansion'],
            ['AMZN', 'Amazon.com Inc.', 155.30, 180.00, 'BUY', 'AWS leadership and retail recovery']
          ];

          const insertStock = db.prepare(`
            INSERT INTO stocks (symbol, company_name, current_price, target_price, rating, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          stocks.forEach(stock => {
            insertStock.run(...stock);
          });

          insertStock.finalize();

          // Insert sample indicators
          const indicators = [
            ['GDP Growth Rate', 2.1, '%', '2024-01-15', 'Quarterly GDP growth'],
            ['Unemployment Rate', 3.8, '%', '2024-01-15', 'Monthly unemployment data'],
            ['CPI Inflation', 3.2, '%', '2024-01-15', 'Consumer price index'],
            ['Federal Funds Rate', 5.375, '%', '2024-01-15', 'Central bank interest rate']
          ];

          const insertIndicator = db.prepare(`
            INSERT INTO indicators (name, value, unit, date, description)
            VALUES (?, ?, ?, ?, ?)
          `);

          indicators.forEach(indicator => {
            insertIndicator.run(...indicator);
          });

          insertIndicator.finalize();

          // Insert sample books
          const books = [
            ['The Intelligent Investor', 'Benjamin Graham', 'Classic value investing principles', 'https://images-na.ssl-images-amazon.com/images/I/91+2lVB8Y2L.jpg', 5, 'read'],
            ['A Random Walk Down Wall Street', 'Burton Malkiel', 'Efficient market hypothesis and index investing', 'https://images-na.ssl-images-amazon.com/images/I/81Q+Qkm4sqL.jpg', 4, 'read'],
            ['Security Analysis', 'Benjamin Graham', 'Fundamental analysis techniques', 'https://images-na.ssl-images-amazon.com/images/I/91+2lVB8Y2L.jpg', 5, 'read']
          ];

          const insertBook = db.prepare(`
            INSERT INTO books (title, author, description, cover_image, rating, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          books.forEach(book => {
            insertBook.run(...book);
          });

          insertBook.finalize();

          console.log('✅ Initial data seeded successfully');
        } else {
          console.log('📊 Database already contains data, skipping seed');
        }
        resolve();
      });
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  seedInitialData
};
