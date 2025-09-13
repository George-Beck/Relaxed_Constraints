const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/books - Get all books
router.get('/', optionalAuth, (req, res) => {
  db.all('SELECT * FROM books ORDER BY title ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Failed to fetch books' });
    }
    
    res.json(rows);
  });
});

// GET /api/books/:id - Get single book
router.get('/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching book:', err);
      return res.status(500).json({ error: 'Failed to fetch book' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(row);
  });
});

// POST /api/books - Create new book (admin only)
router.post('/', authenticateToken, (req, res) => {
  const { title, author, description, cover_image, rating, status } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  db.run(
    'INSERT INTO books (title, author, description, cover_image, rating, status) VALUES (?, ?, ?, ?, ?, ?)',
    [title, author, description, cover_image, rating, status],
    function(err) {
      if (err) {
        console.error('Error creating book:', err);
        return res.status(500).json({ error: 'Failed to create book' });
      }
      
      res.status(201).json({ 
        message: 'Book created successfully',
        id: this.lastID
      });
    }
  );
});

// PUT /api/books/:id - Update book (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, author, description, cover_image, rating, status } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  db.run(
    'UPDATE books SET title = ?, author = ?, description = ?, cover_image = ?, rating = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, author, description, cover_image, rating, status, id],
    function(err) {
      if (err) {
        console.error('Error updating book:', err);
        return res.status(500).json({ error: 'Failed to update book' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      res.json({ message: 'Book updated successfully' });
    }
  );
});

// DELETE /api/books/:id - Delete book (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting book:', err);
      return res.status(500).json({ error: 'Failed to delete book' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  });
});

module.exports = router;
