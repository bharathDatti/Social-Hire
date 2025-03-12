import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { FiMenu, FiX, FiUser, FiBriefcase, FiCalendar, FiBook, FiLogOut, FiFileText, FiCode } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { path: '/profile', label: 'Digi Profile', icon: FiUser },
    { path: '/jobs', label: 'Curated Jobs', icon: FiBriefcase },
    { path: '/mentors', label: 'Book Mentors', icon: FiUser },
    { path: '/webinars', label: 'Events', icon: FiCalendar },
    { path: '/placement', label: 'Placement Prep', icon: FiBook },
    { path: '/resume-builder', label: 'AI Resume', icon: FiFileText },
    { path: '/codelabs', label: 'Code Labs', icon: FiCode },
    { path: '/admin', label: 'Admin', icon: FiUser, requireAdmin: true },
  ];

  const handleNavClick = (path) => {
    setIsOpen(false);
    if (!isAuthenticated) {
      navigate('/login', { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="bg-black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-primary-100 font-bold text-xl sm:text-2xl">Social Hire</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center md:space-x-1 lg:space-x-4 md:overflow-x-auto">
            {navItems.map((item) =>
              (!item.requireAdmin || (isAuthenticated && user?.role === 'admin')) && (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center px-2 py-1 md:text-xs lg:text-base md:whitespace-nowrap lg:px-3 lg:py-2 font-medium text-gray-100 hover:text-blue-400 rounded-md ${
                    location.pathname === item.path ? 'text-orange-400' : ''
                  }`}
                >
                  <item.icon className="mr-1 md:h-3 md:w-3 lg:h-4 lg:w-4" />
                  {item.label}
                </button>
              )
            )}

            {isAuthenticated ? (
              <Menu as="div" className="relative ml-2 lg:ml-4">
                <Menu.Button className="flex items-center text-gray-100 hover:text-blue-400">
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.displayName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-600 font-medium text-base lg:text-lg">
                        {user?.displayName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </Menu.Button>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-900`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-900`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex md:space-x-1 lg:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-100 hover:text-blue-400 px-2 py-1 md:text-xs lg:text-base lg:px-3 lg:py-2 font-medium rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 md:text-xs lg:text-base lg:px-3 lg:py-2 font-medium rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-100 hover:text-blue-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1, height: 'auto' },
          closed: { opacity: 0, height: 0 },
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) =>
            (!item.requireAdmin || (isAuthenticated && user?.role === 'admin')) && (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left flex items-center px-3 py-2 text-base font-medium text-gray-100 hover:bg-primary-50 hover:text-blue-400 rounded-md ${
                  location.pathname === item.path ? 'text-orange-400 bg-primary-50' : ''
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </button>
            )
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-3 py-2 text-base font-medium text-gray-100 hover:bg-primary-50 hover:text-blue-400 rounded-md"
            >
              <FiLogOut className="mr-2 h-5 w-5" />
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 text-base font-medium text-gray-100 hover:bg-primary-50 hover:text-blue-400 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 text-base font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;