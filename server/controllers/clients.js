import Client from '../models/Client.js';
import Project from '../models/Project.js';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createClient = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);
    if (!client || client.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client || client.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    await client.deleteOne();
    await Project.deleteMany({ client: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
