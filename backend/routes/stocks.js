const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/stocks - Get all stocks
router.get('/', optionalAuth, (req, res) => {
  db.all('SELECT * FROM stocks ORDER BY symbol ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching stocks:', err);
      return res.status(500).json({ error: 'Failed to fetch stocks' });
    }
    
    res.json(rows);
  });
});

// GET /api/stocks/:id - Get single stock
router.get('/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM stocks WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching stock:', err);
      return res.status(500).json({ error: 'Failed to fetch stock' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(row);
  });
});

// POST /api/stocks - Create new stock (admin only)
router.post('/', authenticateToken, (req, res) => {
  const { symbol, company_name, current_price, target_price, rating, notes } = req.body;
  
  if (!symbol || !company_name) {
    return res.status(400).json({ error: 'Symbol and company name are required' });
  }
  
  db.run(
    'INSERT INTO stocks (symbol, company_name, current_price, target_price, rating, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [symbol, company_name, current_price, target_price, rating, notes],
    function(err) {
      if (err) {
        console.error('Error creating stock:', err);
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Stock symbol already exists' });
        }
        return res.status(500).json({ error: 'Failed to create stock' });
      }
      
      res.status(201).json({ 
        message: 'Stock created successfully',
        id: this.lastID
      });
    }
  );
});

// PUT /api/stocks/:id - Update stock (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { company_name, current_price, target_price, rating, notes } = req.body;
  
  if (!company_name) {
    return res.status(400).json({ error: 'Company name is required' });
  }
  
  db.run(
    'UPDATE stocks SET company_name = ?, current_price = ?, target_price = ?, rating = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [company_name, current_price, target_price, rating, notes, id],
    function(err) {
      if (err) {
        console.error('Error updating stock:', err);
        return res.status(500).json({ error: 'Failed to update stock' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Stock not found' });
      }
      
      res.json({ message: 'Stock updated successfully' });
    }
  );
});

// DELETE /api/stocks/:id - Delete stock (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM stocks WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting stock:', err);
      return res.status(500).json({ error: 'Failed to delete stock' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json({ message: 'Stock deleted successfully' });
  });
});

module.exports = router;
