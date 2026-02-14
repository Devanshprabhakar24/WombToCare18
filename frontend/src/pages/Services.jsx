
// Services page
import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
    const services = [
        {
            title: 'Child Education',
            description: 'Providing quality education to underprivileged children through scholarships, school infrastructure, and learning resources.',
            icon: '📚',
        },
        {
            title: 'Healthcare Support',
            description: 'Delivering healthcare services to underserved communities including medical camps, preventive care, and health awareness programs.',
            icon: '🏥',
        },
        {
            title: 'Women Empowerment',
            description: 'Empowering women through skill development, vocational training, and entrepreneurship opportunities for financial independence.',
            icon: '💪',
        },
        {
            title: 'Community Development',
            description: 'Building sustainable communities through infrastructure development, clean water projects, and sanitation programs.',
            icon: '🏘️',
        },
        {
            title: 'Environmental Conservation',
            description: 'Protecting the environment through tree plantation drives, waste management programs, and awareness campaigns.',
            icon: '🌱',
        },
        {
            title: 'Disaster Relief',
            description: 'Providing immediate relief and long-term rehabilitation support to communities affected by natural disasters.',
            icon: '🤝',
        },
    ];

    return (
        <div>
            {/* Hero section */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                    <p className="text-xl max-w-2xl mx-auto">
                        Driving positive change through targeted programs that address critical needs in education, healthcare, and community development.
                    </p>
                </div>
            </section>

            {/* Services grid */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                                {/* Service card */}
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-16 bg-primary-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Want to Support Our Work?</h2>
                    <p className="text-xl mb-8">Every contribution helps us expand our services and reach more communities.</p>
                    <Link
                        to="/donate"
                        className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block"
                    >
                        Donate Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Services;
