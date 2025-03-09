import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { FiMenu, FiX, FiUser, FiBriefcase, FiCalendar, FiBook, FiLogOut, FiFileText, FiCode } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { path: '/profile', label: 'Digi Profile', icon: FiUser },
    { path: '/jobs', label: 'Curated jobs', icon: FiBriefcase },
    { path: '/mentors', label: 'Book Mentors', icon: FiUser },
    { path: '/webinars', label: 'Events', icon: FiCalendar },
    { path: '/placement', label: 'Placement Prep', icon: FiBook },
    { path: '/resume-builder', label: 'AI Resume', icon: FiFileText },
    { path: '/codelabs', label: 'Code Labs', icon: FiCode },
    { path: '/admin', label: 'Admin', icon: FiUser, requireAdmin: true }
  ];

  const handleNavClick = (path) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-100 font-bold text-xl">Social Hire</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              (!item.requireAdmin || (isAuthenticated && user?.role === 'admin')) && (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-gray-100 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    location.pathname === item.path ? 'text-orange-400' : ''
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </button>
              )
            ))}

            {isAuthenticated ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex items-center text-gray-100 hover:text-primary-600">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.displayName} className="h-8 w-8 rounded-full" />
                    ) : (
                      <span className="text-primary-600 font-medium">
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block px-4 py-2 text-sm text-gray-900`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-900`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link to="/login" className="text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-100 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <motion.div 
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: 'auto' },
          closed: { opacity: 0, height: 0 }
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            (!item.requireAdmin || (isAuthenticated && user?.role === 'admin')) && (
              <button
                key={item.path}
                onClick={() => {
                  handleNavClick(item.path);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full text-left text-gray-100 hover:bg-primary-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path ? 'text-primary-600 bg-primary-50' : ''
                }`}
              >
                <item.icon className="mr-2" /> {item.label}
              </button>
            )
          ))}

          {isAuthenticated ? (
            <button 
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center w-full text-left text-gray-100 hover:bg-primary-50 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-100 hover:bg-primary-50 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-600 hover:bg-primary-700 text-white block px-3 py-2 rounded-md text-base font-medium"
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