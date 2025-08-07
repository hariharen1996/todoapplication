const Todo = require('../models/Todo');

exports.getTodos = async (req, res, next) => {
  try {
    let query;
    const { timeFilter, statusFilter } = req.query;
    
    if (timeFilter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query = Todo.find({ createdAt: { $gte: startOfDay } });
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = Todo.find({ createdAt: { $gte: weekAgo } });
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = Todo.find({ createdAt: { $gte: monthAgo } });
    } else {
      query = Todo.find();
    }

    if (statusFilter === 'completed') {
      query.where('isChecked').equals(true);
    } else if (statusFilter === 'incomplete') {
      query.where('isChecked').equals(false);
    }

    const todos = await query.sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (err) {
    next(err);
  }
};


exports.createTodo = async (req, res, next) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { isChecked: req.body.isChecked },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};