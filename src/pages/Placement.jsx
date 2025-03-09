import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiCheckCircle, FiFileText, FiVideo, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Placement = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  const toggleFaq = (index) => {
    if (expandedFaqs.includes(index)) {
      setExpandedFaqs(expandedFaqs.filter(i => i !== index));
    } else {
      setExpandedFaqs([...expandedFaqs, index]);
    }
  };

  const resources = [
    {
      title: "Resume Building Guide",
      description: "Learn how to create an impressive resume that stands out to recruiters.",
      icon: <FiFileText className="h-6 w-6" />,
      type: "PDF",
      link: "#"
    },
    {
      title: "Technical Interview Preparation",
      description: "Comprehensive guide to ace technical interviews with practice problems.",
      icon: <FiBook className="h-6 w-6" />,
      type: "Course",
      link: "#"
    },
    {
      title: "Mock Interview Videos",
      description: "Watch mock interviews with feedback from industry professionals.",
      icon: <FiVideo className="h-6 w-6" />,
      type: "Video",
      link: "#"
    },
    {
      title: "Behavioral Interview Questions",
      description: "Common behavioral questions with example answers and tips.",
      icon: <FiFileText className="h-6 w-6" />,
      type: "PDF",
      link: "#"
    },
    {
      title: "Coding Challenge Practice",
      description: "Practice coding challenges similar to those used in technical interviews.",
      icon: <FiBook className="h-6 w-6" />,
      type: "Interactive",
      link: "#"
    },
    {
      title: "Salary Negotiation Guide",
      description: "Learn effective strategies for negotiating your salary and benefits.",
      icon: <FiFileText className="h-6 w-6" />,
      type: "PDF",
      link: "#"
    }
  ];

  const tips = [
    {
      title: "Research the Company",
      description: "Before your interview, thoroughly research the company's products, culture, and recent news. This shows your interest and helps you tailor your answers."
    },
    {
      title: "Practice Common Questions",
      description: "Prepare answers for common questions like 'Tell me about yourself', 'Why do you want to work here?', and 'What are your strengths and weaknesses?'"
    },
    {
      title: "Use the STAR Method",
      description: "When answering behavioral questions, use the STAR method: Situation, Task, Action, and Result to structure your responses clearly."
    },
    {
      title: "Prepare Questions to Ask",
      description: "Have thoughtful questions ready to ask the interviewer. This demonstrates your interest and helps you evaluate if the role is right for you."
    },
    {
      title: "Practice Technical Skills",
      description: "For technical roles, practice coding problems, system design, and other relevant skills regularly before interviews."
    },
    {
      title: "Follow Up After the Interview",
      description: "Send a thank-you email within 24 hours of your interview, expressing your appreciation and reiterating your interest in the position."
    }
  ];

  const faqs = [
    {
      question: "How early should I start preparing for placements?",
      answer: "It's recommended to start preparing at least 3-6 months before the placement season begins. This gives you enough time to strengthen your technical skills, work on your resume, and practice interview questions."
    },
    {
      question: "What should I include in my resume for campus placements?",
      answer: "Your resume should include your education details, relevant coursework, technical skills, projects, internships, achievements, and extracurricular activities. Keep it concise (1-2 pages) and highlight experiences relevant to the job you're applying for."
    },
    {
      question: "How can I improve my technical interview skills?",
      answer: "Practice coding problems regularly on platforms like LeetCode, HackerRank, or CodeSignal. Understand data structures and algorithms thoroughly. Participate in mock interviews and coding contests. Review computer science fundamentals and be prepared to explain your thought process."
    },
    {
      question: "What should I wear for a placement interview?",
      answer: "For most companies, business casual or formal attire is appropriate. Men can wear a formal shirt, trousers, and formal shoes. Women can wear a formal shirt/blouse with trousers/skirt or a formal dress. When in doubt, it's better to be slightly overdressed than underdressed."
    },
    {
      question: "How do I handle rejection during placements?",
      answer: "Rejection is a normal part of the placement process. Use it as a learning opportunity by asking for feedback when possible. Stay positive, reflect on areas for improvement, and continue applying to other companies. Remember that each interview provides valuable experience for future opportunities."
    },
    {
      question: "Should I accept the first job offer I receive?",
      answer: "Not necessarily. Consider factors like the role, company culture, growth opportunities, compensation, and work-life balance. If you have time before needing to respond, it's okay to wait for other potential offers to make an informed decision. However, be respectful of deadlines and communicate clearly with recruiters."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen  bg-black bg-[url('./bg-3.png')] bg-no-repeat bg-cover bg-center  py-12">
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
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'resources'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'tips'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Interview Tips
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'faqs'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>
        
        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resources.map((resource, index) => (
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
                  
                  <a
                    href={resource.link}
                    className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
                  >
                    <FiDownload className="mr-2" /> Download Resource
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex"
                >
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
        
        {/* FAQs Tab */}
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

export default Placement;