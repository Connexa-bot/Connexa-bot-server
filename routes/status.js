// routes/status.js
// ===============================
// Status update routes
// ===============================

import express from 'express';
import { postStatus, getStatusContacts } from '../controllers/status.js';

const router = express.Router();

// POST a status update
router.post('/post', postStatus);

// GET contacts for status privacy list
router.get('/contacts/:phone', getStatusContacts);

export default router;
