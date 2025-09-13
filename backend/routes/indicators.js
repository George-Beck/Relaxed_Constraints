const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/indicators - Get all indicators
router.get('/', optionalAuth, (req, res) => {
  db.all('SELECT * FROM indicators ORDER BY date DESC, name ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching indicators:', err);
      return res.status(500).json({ error: 'Failed to fetch indicators' });
    }
    
    res.json(rows);
  });
});

// GET /api/indicators/:id - Get single indicator
router.get('/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM indicators WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching indicator:', err);
      return res.status(500).json({ error: 'Failed to fetch indicator' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Indicator not found' });
    }
    
    res.json(row);
  });
});

// POST /api/indicators - Create new indicator (admin only)
router.post('/', authenticateToken, (req, res) => {
  const { name, value, unit, date, description } = req.body;
  
  if (!name || value === undefined || !date) {
    return res.status(400).json({ error: 'Name, value, and date are required' });
  }
  
  db.run(
    'INSERT INTO indicators (name, value, unit, date, description) VALUES (?, ?, ?, ?, ?)',
    [name, value, unit, date, description],
    function(err) {
      if (err) {
        console.error('Error creating indicator:', err);
        return res.status(500).json({ error: 'Failed to create indicator' });
      }
      
      res.status(201).json({ 
        message: 'Indicator created successfully',
        id: this.lastID
      });
    }
  );
});

// PUT /api/indicators/:id - Update indicator (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, value, unit, date, description } = req.body;
  
  if (!name || value === undefined || !date) {
    return res.status(400).json({ error: 'Name, value, and date are required' });
  }
  
  db.run(
    'UPDATE indicators SET name = ?, value = ?, unit = ?, date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, value, unit, date, description, id],
    function(err) {
      if (err) {
        console.error('Error updating indicator:', err);
        return res.status(500).json({ error: 'Failed to update indicator' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Indicator not found' });
      }
      
      res.json({ message: 'Indicator updated successfully' });
    }
  );
});

// DELETE /api/indicators/:id - Delete indicator (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM indicators WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting indicator:', err);
      return res.status(500).json({ error: 'Failed to delete indicator' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Indicator not found' });
    }
    
    res.json({ message: 'Indicator deleted successfully' });
  });
});

module.exports = router;
