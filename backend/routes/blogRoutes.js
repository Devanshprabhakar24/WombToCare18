import express from 'express';
import { getPosts, getPostById, createPost, updatePost, deletePost } from '../controllers/blogController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Admin routes
router.post('/', authenticateToken, authorizeRole(['admin']), createPost);
router.put('/:id', authenticateToken, authorizeRole(['admin']), updatePost);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deletePost);

export default router;
