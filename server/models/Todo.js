const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a task name'],
    trim: true,
    maxlength: [100, 'Task name cannot exceed 100 characters']
  },
  isChecked: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('Todo', todoSchema);