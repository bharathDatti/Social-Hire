import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' }
    ],
    resources: [
      { label: 'Blog', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Career Tips', href: '#' },
      { label: 'Student Guide', href: '#' }
    ],
    social: [
      { label: 'GitHub', href: '#', icon: FiGithub },
      { label: 'Twitter', href: '#', icon: FiTwitter },
      { label: 'LinkedIn', href: '#', icon: FiLinkedin },
      { label: 'Email', href: 'mailto:contact@studentportal.com', icon: FiMail }
    ]
  };

  return (
    <footer className="bg-black border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="text-primary-100 font-bold text-xl">
              SocialHire
            </Link>
            <p className="mt-4 text-sm text-gray-100">
              Your one-stop platform for career development and professional growth.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-base text-gray-100 hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-base text-gray-100 hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
              Connect With Us
            </h3>
            <ul className="mt-4 space-y-4">
              {links.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-base text-gray-100 hover:text-primary-600 flex items-center"
                  >
                    <link.icon className="h-5 w-5 mr-2" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-100">
              © {currentYear} SocialHire. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {links.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-100 hover:text-primary-600"
                >
                  <span className="sr-only">{link.label}</span>
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;