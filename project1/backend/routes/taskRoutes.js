const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTask, deleteTask, addComment } = require('../controller/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
