// Blog logic
import Blog from '../models/Blog.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// All posts
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

// Single post
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

// Create post
export const createPost = asyncHandler(async (req, res) => {
    const { title, content, excerpt, author, category, imageURL } = req.body;

    const post = await Blog.create({ title, content, excerpt, author, category, imageURL });

    res.status(201).json({
        success: true,
        data: { id: post._id.toString(), title: post.title },
        message: 'Post created successfully',
    });
});

// Update post
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

// Delete post
export const deletePost = asyncHandler(async (req, res) => {
    const post = await Blog.findByIdAndDelete(req.params.id);

    if (!post) {
        return res.status(404).json({ error: { message: 'Post not found', code: 'NOT_FOUND' } });
    }

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
});
