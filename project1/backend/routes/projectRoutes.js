const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectDetails, addMember } = require('../controller/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/:id/members', addMember);

module.exports = router;
