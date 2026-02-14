// Blog model
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
    },
    category: {
        type: String,
        enum: ['blog', 'press'],
        default: 'blog',
    },
    imageURL: {
        type: String,
        default: null,
    },
    published: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ published: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
