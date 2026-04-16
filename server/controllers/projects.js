import Project from '../models/Project.js';

export const getProjects = async (req, res) => {
  try {
    let query;
    if (req.params.clientId) {
      query = Project.find({ client: req.params.clientId, user: req.user.id });
    } else {
      query = Project.find({ user: req.user.id }).populate({
        path: 'client',
        select: 'name email company'
      });
    }

    const projects = await query.sort('-createdAt');
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id }).populate({
      path: 'client',
      select: 'name email company'
    });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createProject = async (req, res) => {
  try {
    req.body.user = req.user.id;
    if (req.params.clientId) {
      req.body.client = req.params.clientId;
    }
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await project.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
