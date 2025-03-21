import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchJobs, deleteJob } from '../redux/slices/jobsSlice';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiSearch, FiFilter, FiShare2, FiCalendar } from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import { toast } from 'react-toastify';
import bg3 from '/bg-3.png';

const JOBS_PER_PAGE = 5;

const Jobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, loading } = useSelector(state => state.jobs);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    experienceLevel: '',
    datePosted: '',
    salaryRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sharedJobId, setSharedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const calculateTimeRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const timeLeft = expiry - now;
    if (timeLeft <= 0) return 'Expired';
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days} day${days > 1 ? 's' : ''} left` : `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const isAboutToExpire = (expiryDate) => {
    if (!expiryDate) return false;
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const timeLeft = expiry - now;
    return timeLeft > 0 && timeLeft <= 24 * 60 * 60 * 1000; // Less than or equal to 24 hours
  };

  useEffect(() => {
    const checkExpiredJobs = () => {
      jobs.forEach(job => {
        if (job.expiryDate && new Date(job.expiryDate).getTime() <= new Date().getTime()) {
          dispatch(deleteJob(job.id));
        }
      });
    };
    checkExpiredJobs();
    const interval = setInterval(checkExpiredJobs, 60000);
    return () => clearInterval(interval);
  }, [jobs, dispatch]);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get('jobId');
    if (jobId) {
      setSharedJobId(jobId);
      const job = jobs.find(j => j.id === jobId);
      if (job) setSelectedJob(job);
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname + location.search } });
      }
    }
  }, [location, isAuthenticated, navigate, jobs]);

  const parseSalary = (salaryString) => {
    if (!salaryString) return { min: 0, max: Infinity };
    const range = salaryString.split('-');
    const min = parseFloat(range[0]);
    const max = parseFloat(range[1]);
    return { min, max };
  };

  const parseExperience = (experienceString) => {
    if (!experienceString) return { type: 'Unknown', min: 0, max: Infinity };
    if (experienceString === 'Internship') return { type: 'Internship', min: 0, max: 0 };
    if (experienceString === '0 years') return { type: 'Entry-Level', min: 0, max: 0 };
    if (experienceString.includes('-')) {
      const range = experienceString.split('-');
      const min = parseFloat(range[0]);
      const max = parseFloat(range[1]);
      return { type: 'Experienced', min, max };
    }
    const years = parseFloat(experienceString);
    return { type: 'Experienced', min: years, max: years };
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === '' || job.type === filters.type;
    const matchesLocation = filters.location === '' || job.location.includes(filters.location);
    const matchesExperienceLevel = filters.experienceLevel === '' || (() => {
      const { type, min, max } = parseExperience(job.experienceLevel);
      switch (filters.experienceLevel) {
        case 'Internship':
          return type === 'Internship';
        case 'Entry-Level':
          return type === 'Entry-Level' || (min >= 0 && max <= 1);
        case 'Experienced':
          return type === 'Experienced' && min > 1;
        default:
          return true;
      }
    })();
    const matchesDatePosted = filters.datePosted === '' || {
      'Past 24 hours': new Date(job.createdAt) > new Date(new Date().setDate(new Date().getDate() - 1)),
      'Past Week': new Date(job.createdAt) > new Date(new Date().setDate(new Date().getDate() - 7)),
      'Past Month': new Date(job.createdAt) > new Date(new Date().setMonth(new Date().getMonth() - 1))
    }[filters.datePosted];
    const matchesSalaryRange = filters.salaryRange === '' || (() => {
      const { min: jobMin, max: jobMax } = parseSalary(job.salary);
      const filterRange = {
        '0-2 LPA': { min: 0, max: 2 },
        '3-5 LPA': { min: 3, max: 5 },
        '6-8 LPA': { min: 6, max: 8 },
        '9-11 LPA': { min: 9, max: 11 },
        '12-14 LPA': { min: 12, max: 14 },
        'More than 14 LPA': { min: 14, max: Infinity }
      }[filters.salaryRange];

      if (!filterRange) return true;

      return (
        jobMin <= filterRange.max && jobMax >= filterRange.min
      );
    })();

    return matchesSearch && matchesType && matchesLocation && matchesExperienceLevel && matchesDatePosted && matchesSalaryRange;
  }).sort((a, b) => {
    // Prioritize jobs expiring within 24 hours
    const aExpiringSoon = isAboutToExpire(a.expiryDate);
    const bExpiringSoon = isAboutToExpire(b.expiryDate);

    if (aExpiringSoon && !bExpiringSoon) return -1; // a goes first
    if (!aExpiringSoon && bExpiringSoon) return 1;  // b goes first

    // If both are expiring soon or neither are, sort by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const displayedJobs = filteredJobs.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ type: '', location: '', experienceLevel: '', datePosted: '', salaryRange: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleShare = async (jobId) => {
    const shareUrl = `${window.location.origin}/jobs?jobId=${jobId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Job Opportunity',
          text: 'Check out this job opportunity!',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Job link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Job link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to share job link');
      }
    }
  };

  const locations = [...new Set(jobs.map(job => job.location))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-black bg-no-repeat bg-cover bg-center py-12" style={{ backgroundImage: `url(${bg3})` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-100">Job Listings</h1>
          <p className="mt-2 text-lg text-gray-300">Find and apply for curated job opportunities</p>
        </motion.div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-2/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, company, or keywords"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full md:w-auto"
            >
              <FiFilter className="mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-white rounded-md shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select id="location" name="location" value={filters.location} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">All Locations</option>
                    {locations.map((location, index) => (
                      <option key={index} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select id="experienceLevel" name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">All Levels</option>
                    <option value="Internship">Internship</option>
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Experienced">Experienced</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="datePosted" className="block text-sm font-medium text-gray-700 mb-1">Date Posted</label>
                  <select id="datePosted" name="datePosted" value={filters.datePosted} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Any Time</option>
                    <option value="Past 24 hours">Past 24 hours</option>
                    <option value="Past Week">Past Week</option>
                    <option value="Past Month">Past Month</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <select id="salaryRange" name="salaryRange" value={filters.salaryRange} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">All Salaries</option>
                    <option value="0-2 LPA">0-2 LPA</option>
                    <option value="3-5 LPA">3-5 LPA</option>
                    <option value="6-8 LPA">6-8 LPA</option>
                    <option value="9-11 LPA">9-11 LPA</option>
                    <option value="12-14 LPA">12-14 LPA</option>
                    <option value="More than 14 LPA">More than 14 LPA</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={resetFilters} className="text-primary-600 hover:text-primary-800 font-medium">
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {loading && displayedJobs.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiBriefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            <div className="mt-6">
              <button onClick={resetFilters} className="text-primary-600 hover:text-primary-800 font-medium">
                Reset all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {displayedJobs.map(job => (
                  <motion.div 
                    key={job.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer mb-4 ${
                      selectedJob?.id === job.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    variants={itemVariants}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-primary-600 font-medium">{job.company}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {job.type}
                          </div>
                          {job.expiryDate && (
                            <div className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                              isAboutToExpire(job.expiryDate) 
                                ? 'bg-red-100 text-red-800 animate-pulse'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <FiCalendar className="inline-block mr-1" />
                              {calculateTimeRemaining(job.expiryDate)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiMapPin className="mr-2 h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaRupeeSign className="mr-2 h-4 w-4" />
                          {job.salary}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white rounded-md shadow hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Render Page Numbers */}
                  {(() => {
                    const pages = [];
                    let startPage = Math.max(1, currentPage - 1);
                    let endPage = Math.min(totalPages, currentPage + 1);

                    if (currentPage === 1) {
                      endPage = Math.min(totalPages, 3);
                    } else if (currentPage === totalPages) {
                      startPage = Math.max(1, totalPages - 2);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-4 py-2 rounded-md shadow ${
                            currentPage === i
                              ? 'bg-primary-600 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white rounded-md shadow hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-4 h-fit">
              {selectedJob ? (
                <motion.div 
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                        <p className="text-lg text-primary-600">{selectedJob.company}</p>
                      </div>
                      <button
                        onClick={() => handleShare(selectedJob.id)}
                        className="text-gray-500 hover:text-primary-600 transition-colors"
                        title="Share job"
                      >
                        <FiShare2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="mr-2 h-5 w-5" />
                        {selectedJob.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaRupeeSign className="mr-2 h-5 w-5" />
                        {selectedJob.salary}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiBriefcase className="mr-2 h-5 w-5" />
                        {selectedJob.type}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiClock className="mr-2 h-5 w-5" />
                        Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                      </div>
                      {selectedJob.requirements && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                          <p className="text-gray-600 whitespace-pre-line">{selectedJob.requirements}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-8">
                      {selectedJob.applicationUrl ? (
                        <a
                          href={selectedJob.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full text-center"
                        >
                          Apply Now
                        </a>
                      ) : (
                        <button className="btn-primary w-full">Apply Now</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <FiBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Select a job to view details</h3>
                  <p className="mt-2 text-gray-500">Click on any job from the list to view its complete information</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;