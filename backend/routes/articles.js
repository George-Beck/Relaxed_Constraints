const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/articles - Get all articles
router.get('/', optionalAuth, (req, res) => {
  const { category, search } = req.query;
  
  let query = 'SELECT * FROM articles';
  let params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  if (search) {
    const searchCondition = category ? ' AND' : ' WHERE';
    query += `${searchCondition} (title LIKE ? OR content LIKE ? OR tags LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ' ORDER BY date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching articles:', err);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }
    
    // Parse tags from JSON strings
    const articles = rows.map(row => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
    
    res.json(articles);
  });
});

// GET /api/articles/:id - Get single article
router.get('/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching article:', err);
      return res.status(500).json({ error: 'Failed to fetch article' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Parse tags from JSON string
    const article = {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    };
    
    res.json(article);
  });
});

// POST /api/articles - Create new article (admin only)
router.post('/', authenticateToken, (req, res) => {
  const { id, title, category, content, date, tags } = req.body;
  
  if (!id || !title || !category || !content || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);
  
  db.run(
    'INSERT INTO articles (id, title, category, content, date, tags) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, category, content, date, tagsJson],
    function(err) {
      if (err) {
        console.error('Error creating article:', err);
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Article ID already exists' });
        }
        return res.status(500).json({ error: 'Failed to create article' });
      }
      
      res.status(201).json({ 
        message: 'Article created successfully',
        id: this.lastID
      });
    }
  );
});

// PUT /api/articles/:id - Update article (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, category, content, date, tags } = req.body;
  
  if (!title || !category || !content || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);
  
  db.run(
    'UPDATE articles SET title = ?, category = ?, content = ?, date = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, category, content, date, tagsJson, id],
    function(err) {
      if (err) {
        console.error('Error updating article:', err);
        return res.status(500).json({ error: 'Failed to update article' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      res.json({ message: 'Article updated successfully' });
    }
  );
});

// DELETE /api/articles/:id - Delete article (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting article:', err);
      return res.status(500).json({ error: 'Failed to delete article' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ message: 'Article deleted successfully' });
  });
});

module.exports = router;
