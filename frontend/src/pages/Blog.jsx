// Blog page
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/blog?category=blog');
      if (response.data && response.data.data) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Fallback static data
      setPosts([
        {
          id: '1',
          title: 'Our Impact in 2025',
          excerpt: 'Looking back at the amazing work we accomplished together this year.',
          createdAt: '2025-01-15',
          author: 'Foundation Team',
        },
        {
          id: '2',
          title: 'New Program Launch: Digital Literacy',
          excerpt: 'Excited to announce our new digital literacy program for rural youth.',
          createdAt: '2025-02-01',
          author: 'Foundation Team',
        },
        {
          id: '3',
          title: 'Quarterly Transparency Report',
          excerpt: 'Our quarterly transparency report detailing fund utilization is now available.',
          createdAt: '2025-03-10',
          author: 'Foundation Team',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Stories, updates, and insights from our foundation's work.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-8">Loading blog posts...</div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary-600 text-sm font-medium">
                      {post.author || 'Foundation Team'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold mb-3">{post.title}</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {post.excerpt || (post.content && post.content.substring(0, 200) + '...')}
                  </p>
                  {post.content && (
                    <button className="text-primary-600 hover:underline mt-4 font-medium">
                      Read More →
                    </button>
                  )}
                </article>
              ))}
              {posts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No blog posts available yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
