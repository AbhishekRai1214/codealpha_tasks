const Project = require('../model/Project');
const User = require('../model/User');



const createProject = async (req, res) =>{
  const { name, description } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectDetails = async (req, res) =>{
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Verify membership
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember && project.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  const { email } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
   
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (project.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ message: 'Only project members can invite others' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User with this email not found' });
    }


    const alreadyMember = project.members.some(m => m.toString() === userToInvite._id.toString());
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToInvite._id);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

  
    if (req.io) {
      req.io.to(project._id.toString()).emit('projectUpdated', updatedProject);
      req.io.to(userToInvite._id.toString()).emit('notification', {
        type: 'PROJECT_INVITE',
        message: `${req.user.name} invited you to project "${project.name}"`,
        project: updatedProject
      });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectDetails, addMember };
