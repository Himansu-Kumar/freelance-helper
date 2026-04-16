import express from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clients.js';
import { protect } from '../middleware/auth.js';
import projectRouter from './projects.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:clientId/projects', projectRouter);

router.route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router.route('/:id')
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

export default router;
