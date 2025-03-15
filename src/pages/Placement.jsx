import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiBook, FiCheckCircle, FiFileText, FiVideo, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { fetchResources, fetchTips, fetchFaqs } from '../redux/slices/placementSlice';

const PlacementPage = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  const dispatch = useDispatch();
  const { resources, tips, faqs, status } = useSelector((state) => state.placement);

  // Static resources data (from your first placement.jsx)
  const staticResources = [
    {
      title: 'Resume Building Guide',
      description: 'Learn how to create an impressive resume that stands out to recruiters.',
      icon: <FiFileText className="h-6 w-6" />,
      type: 'PDF',
      link: '/Resume_builder.pdf', // Path to PDF in the public folder
    },
    {
      title: 'Technical Interview Preparation',
      description: 'Comprehensive guide to ace technical interviews with practice problems.',
      icon: <FiBook className="h-6 w-6" />,
      type: 'Course',
      link: '/Frequently_Interviews_Answers.pdf',
    },
    {
      title: 'Mock Interview Videos',
      description: 'Watch mock interviews with feedback from industry professionals.',
      icon: <FiVideo className="h-6 w-6" />,
      type: 'Video',
      link: '#',
    },
    {
      title: 'Behavioral Interview Questions',
      description: 'Common behavioral questions with example answers and tips.',
      icon: <FiFileText className="h-6 w-6" />,
      type: 'PDF',
      link: '/Frequently_Interviews_Answers.pdf', // Path to PDF in the public folder
    },
    {
      title: 'Coding Challenge Practice',
      description: 'Practice coding challenges similar to those used in technical interviews.',
      icon: <FiBook className="h-6 w-6" />,
      type: 'Interactive',
      link: '/Tips_for_Success_in_Coding_Tests_Conducted_by_Companies.pdf',
    },
    {
      title: 'Salary Negotiation Guide',
      description: 'Learn effective strategies for negotiating your salary and benefits.',
      icon: <FiFileText className="h-6 w-6" />,
      type: 'PDF',
      link: '/Salary_Negotiation_Tips.pdf', // Path to PDF in the public folder
    },
  ];

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchTips());
    dispatch(fetchFaqs());
  }, [dispatch]);

  const toggleFaq = (index) => {
    setExpandedFaqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDownload = (link, title) => {
    const a = document.createElement('a');
    a.href = link;
    a.download = `${title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  if (status === 'loading')
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-10 w-10 text-primary-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );

  return (
    <div className="min-h-screen bg-black bg-[url('./bg-3.png')] bg-no-repeat bg-cover bg-center py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-100">Placement Preparation</h1>
          <p className="mt-2 text-lg text-gray-300">Resources and guidance to help you prepare for job placements</p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            {['resources', 'tips', 'faqs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'resources' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {staticResources.map((resource, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                      {resource.icon}
                    </div>
                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  {resource.type === 'PDF' ? (
                    <button
                      onClick={() => handleDownload(resource.link, resource.title)}
                      className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
                    >
                      <FiDownload className="mr-2" /> Download Resource
                    </button>
                  ) : (
                    <a
                      href={resource.link}
                      className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
                    >
                      <FiDownload className="mr-2" /> Access Resource
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tips and FAQs tabs remain unchanged */}
        {activeTab === 'tips' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <motion.div key={index} variants={itemVariants} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                      <FiCheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'faqs' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                    {expandedFaqs.includes(index) ? (
                      <FiChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaqs.includes(index) && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlacementPage;