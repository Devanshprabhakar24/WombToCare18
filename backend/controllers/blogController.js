import Blog from '../models/Blog.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all published posts (blog or press)
 * @route GET /api/blog?category=blog|press
 */
export const getPosts = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = { published: true };
    if (category && ['blog', 'press'].includes(category)) {
        query.category = category;
    }

    const posts = await Blog.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
        success: true,
        data: posts.map(post => ({
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            author: post.author,
            category: post.category,
            imageURL: post.imageURL,
            createdAt: post.createdAt,
        })),
        count: posts.length,
    });
});

/**
 * Get single post by ID
 * @route GET /api/blog/:id
 */
export const getPostById = asyncHandler(async (req, res) => {
    const post = await Blog.findById(req.params.id).lean();

    if (!post) {
        return res.status(404).json({ error: { message: 'Post not found', code: 'NOT_FOUND' } });
    }

    res.status(200).json({
        success: true,
        data: {
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            author: post.author,
            category: post.category,
            imageURL: post.imageURL,
            createdAt: post.createdAt,
        },
    });
});

/**
 * Create a new post (admin only)
 * @route POST /api/blog
 */
export const createPost = asyncHandler(async (req, res) => {
    const { title, content, excerpt, author, category, imageURL } = req.body;

    const post = await Blog.create({ title, content, excerpt, author, category, imageURL });

    res.status(201).json({
        success: true,
        data: { id: post._id.toString(), title: post.title },
        message: 'Post created successfully',
    });
});

/**
 * Update a post (admin only)
 * @route PUT /api/blog/:id
 */
export const updatePost = asyncHandler(async (req, res) => {
    const post = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!post) {
        return res.status(404).json({ error: { message: 'Post not found', code: 'NOT_FOUND' } });
    }

    res.status(200).json({ success: true, data: post, message: 'Post updated successfully' });
});

/**
 * Delete a post (admin only)
 * @route DELETE /api/blog/:id
 */
export const deletePost = asyncHandler(async (req, res) => {
    const post = await Blog.findByIdAndDelete(req.params.id);

    if (!post) {
        return res.status(404).json({ error: { message: 'Post not found', code: 'NOT_FOUND' } });
    }

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
});
