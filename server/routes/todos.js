const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, search, time } = req.query;
    const query = {};
    
    if (status === 'completed') query.isCompleted = true;
    if (status === 'incomplete') query.isCompleted = false;
    
    if (search) query.text = { $regex: search, $options: 'i' };
    
    if (time) {
      const now = new Date();
      let dateFilter;
      
      switch (time) {
        case 'today':
          dateFilter = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          dateFilter = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          dateFilter = null;
      }
      
      if (dateFilter) query.createdAt = { $gte: dateFilter };
    }
    
    const todos = await Todo.find(query).sort('-createdAt');
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const todo = await Todo.create({ text });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { text, isCompleted } = req.body;
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    
    if (text !== undefined) todo.text = text;
    if (isCompleted !== undefined) todo.isCompleted = isCompleted;
    
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;