import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Press = () => {
    const [pressItems, setPressItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPress();
    }, []);

    const fetchPress = async () => {
        try {
            const response = await api.get('/blog?category=press');
            if (response.data && response.data.data) {
                setPressItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching press:', error);
            // Fallback static data
            setPressItems([
                {
                    id: '1',
                    title: 'Foundation Featured in National Media',
                    excerpt: 'Our work in child education was highlighted in a leading national daily for its impact-driven approach.',
                    createdAt: '2025-12-15',
                    author: 'Media Team',
                },
                {
                    id: '2',
                    title: 'Partnership with State Government Announced',
                    excerpt: 'A new partnership to expand healthcare services across rural districts was formally announced at a state-level event.',
                    createdAt: '2025-11-20',
                    author: 'Media Team',
                },
                {
                    id: '3',
                    title: 'Annual Transparency Report Released',
                    excerpt: 'Our annual report showcasing fund utilization and program outcomes is now available for public review.',
                    createdAt: '2025-10-01',
                    author: 'Media Team',
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
                    <h1 className="text-4xl font-bold mb-4">Press & Media</h1>
                    <p className="text-xl max-w-2xl mx-auto">
                        News coverage, media mentions, and official announcements from our foundation.
                    </p>
                </div>
            </section>

            {/* Press Items */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center py-8">Loading press articles...</div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {pressItems.map((item) => (
                                <article key={item.id} className="bg-white rounded-lg shadow-md p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                            Press Release
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-semibold mb-3">{item.title}</h2>
                                    <p className="text-gray-700 leading-relaxed">{item.excerpt}</p>
                                    {item.content && (
                                        <button className="text-primary-600 hover:underline mt-4 font-medium">
                                            Read Full Article →
                                        </button>
                                    )}
                                </article>
                            ))}
                            {pressItems.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    No press articles available yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Press;
