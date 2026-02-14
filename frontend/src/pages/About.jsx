// About page
import React from 'react';

const About = () => {
  const team = [
    { name: 'Ananya ', role: 'Founder', description: 'Over 15 years of experience in nonprofit management and social impact.' },
    { name: 'Rajesh', role: 'Director', description: 'Leads all field operations and program implementation across regions.' },
    { name: 'Priya', role: 'Finance Head', description: 'Ensures all funds are managed and reported with full transparency.' },
    { name: 'Vikram', role: 'Program Head', description: 'Connects with communities to design programs that address real needs.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Learn about our mission, our team, and how we're making a difference.
          </p>
        </div>
      </section>

      {/* About section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">WombTo18 Foundation</h2>
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-r-lg mb-8">
              <p className="text-primary-800 font-medium">
                WombTo18 Foundation is a registered Section 8 Company under the Companies Act, 2013,
                dedicated to creating sustainable impact through transparent and accountable giving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission/vision */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-primary-600">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To empower underprivileged communities through education, healthcare, and sustainable
                development programs. We believe every child deserves access to quality education from
                the womb to 18 years of age and beyond.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-primary-600">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                To build a world where every contribution makes a measurable difference, where
                transparency in charitable giving is the norm, and where every child has the
                opportunity to reach their full potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Founded with a simple belief — that every child deserves support from birth
                through adulthood — WombTo18 Foundation has grown into a platform that connects
                generous donors with impactful programs.
              </p>
              <p>
                As a Section 8 company, we operate on a not-for-profit basis, reinvesting every
                rupee into our programs. Our transparency model ensures donors can track exactly
                how their funds are being utilized, from receipt to impact.
              </p>
              <p>
                We issue 80G and 12A certificates for all donations, making your contributions
                tax-deductible while creating real change in communities that need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: '🔍', title: 'Transparency', desc: 'Complete visibility into how every rupee is utilized.' },
                { icon: '📊', title: 'Accountability', desc: 'Regular reports and audits to maintain trust.' },
                { icon: '💡', title: 'Impact-Driven', desc: 'Programs designed around measurable outcomes.' },
                { icon: '🤝', title: 'Community First', desc: 'Empowering communities to drive their own development.' },
              ].map((value, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 flex items-start gap-4">
                  <span className="text-3xl">{value.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{value.title}</h3>
                    <p className="text-gray-600">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {team.map((member, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-primary-600 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
