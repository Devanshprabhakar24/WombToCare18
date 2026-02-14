import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav links by role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      // Admin links
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/programs', label: 'Programs' },
        { to: '/impact-reports', label: 'Reports' },
        { to: '/blog', label: 'Blog' },
        { to: '/press', label: 'Press' },
      ];
    }

    if (user?.role === 'donor') {
      // Donor links
      return [
        { to: '/', label: 'Home' },
        { to: '/dashboard', label: 'My Dashboard' },
        { to: '/about', label: 'About Us' },
        { to: '/programs', label: 'Programs' },
        { to: '/blog', label: 'Blog' },
        { to: '/press', label: 'Press' },
        { to: '/impact-reports', label: 'Reports' },
      ];
    }

    // Public links
    return [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About' },
      { to: '/services', label: 'Services' },
      { to: '/programs', label: 'Programs' },
      { to: '/blog', label: 'Blog' },
      { to: '/press', label: 'Press' },
      { to: '/donor-wall', label: 'Donor Wall' },
      { to: '/impact-reports', label: 'Reports' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white shadow-md relative z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-primary-600 whitespace-nowrap">
            WombTo18 Foundation
          </Link>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 text-2xl"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-gray-700 hover:text-primary-600">
                {link.label}
              </Link>
            ))}

            <span className="text-gray-300">|</span>

            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link
                    to="/donate"
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700"
                  >
                    Donate Now
                  </Link>
                )}
                <span className="text-gray-500 text-xs">Hi, {user.name?.split(' ')[0]}</span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}

            <hr className="border-gray-200" />

            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link
                    to="/donate"
                    onClick={() => setMenuOpen(false)}
                    className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Donate Now
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Login</Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
