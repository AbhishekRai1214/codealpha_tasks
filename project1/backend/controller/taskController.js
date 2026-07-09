const Task = require('../model/Task');
const Project = require('../model/Project');

const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Verify membership
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (project.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignee } = req.body;
  try {
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Verify membership
    const isMember = proj.members.some(m => m.toString() === req.user._id.toString());
    if (proj.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignee: assignee || undefined
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    // Socket broadcast
    if (req.io) {
      req.io.to(project.toString()).emit('taskCreated', populatedTask);
      if (assignee && assignee !== req.user._id.toString()) {
        req.io.to(assignee.toString()).emit('notification', {
          type: 'TASK_ASSIGNED',
          message: `${req.user.name} assigned you the task "${title}" in "${proj.name}"`,
          task: populatedTask
        });
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const proj = await Project.findById(task.project);
    // Verify membership
    const isMember = proj.members.some(m => m.toString() === req.user._id.toString());
    if (proj.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prevAssignee = task.assignee ? task.assignee.toString() : null;

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.assignee = assignee !== undefined ? (assignee ? assignee : undefined) : task.assignee;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    // Socket broadcast
    if (req.io) {
      req.io.to(task.project.toString()).emit('taskUpdated', populatedTask);

      // Notify if new assignee is set
      const newAssignee = assignee ? assignee.toString() : null;
      if (newAssignee && newAssignee !== prevAssignee && newAssignee !== req.user._id.toString()) {
        req.io.to(newAssignee).emit('notification', {
          type: 'TASK_ASSIGNED',
          message: `${req.user.name} assigned you the task "${task.title}" in "${proj.name}"`,
          task: populatedTask
        });
      }
    }

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const proj = await Project.findById(task.project);
    // Verify membership
    const isMember = proj.members.some(m => m.toString() === req.user._id.toString());
    if (proj.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Socket broadcast
    if (req.io) {
      req.io.to(task.project.toString()).emit('taskDeleted', { taskId: req.params.id });
    }

    res.json({ message: 'Task deleted successfully', taskId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  const { text } = req.body;
  try {
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const proj = await Project.findById(task.project);
    const isMember = proj.members.some(m => m.toString() === req.user._id.toString());
    if (proj.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      text,
      author: req.user._id
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    // Socket broadcast
    if (req.io) {
      req.io.to(task.project.toString()).emit('taskUpdated', populatedTask);
      
      // Notify assignee if someone else commented
      if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
        req.io.to(task.assignee.toString()).emit('notification', {
          type: 'TASK_COMMENT',
          message: `${req.user.name} commented on "${task.title}": "${text.substring(0, 30)}..."`,
          task: populatedTask
        });
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  addComment
};
