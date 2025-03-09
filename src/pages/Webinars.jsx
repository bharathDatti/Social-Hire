import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchWebinarsAndSessions } from '../redux/slices/webinarsSlice';
import { FiCalendar, FiClock, FiUser, FiVideo, FiExternalLink, FiBriefcase } from 'react-icons/fi';

const Webinars = () => {
  const dispatch = useDispatch();
  const { items: allItems, loading } = useSelector(state => state.webinars);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchWebinarsAndSessions());
  }, [dispatch]);

  // Filter sessions for the current user
  const userSessions = allItems.filter(item => 
    item.type === 'session' && item.studentId === user?.uid
  );

  // Get webinars
  const webinars = allItems.filter(item => item.type === 'webinar');

  // Combine and sort all items
  const combinedItems = [...webinars, ...userSessions];

  // Separate upcoming and past items
  const currentDate = new Date();
  const upcomingItems = combinedItems.filter(item => new Date(item.date) >= currentDate);
  const pastItems = combinedItems.filter(item => new Date(item.date) < currentDate);

  // Sort items by date
  upcomingItems.sort((a, b) => new Date(a.date) - new Date(b.date));
  pastItems.sort((a, b) => new Date(b.date) - new Date(a.date));

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

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleJoinSession = (session) => {
    if (session.sessionLink) {
      window.open(session.sessionLink, '_blank');
    }
  };

  const getSessionStatus = (session) => {
    const sessionDate = new Date(session.date);
    const sessionTime = session.time.split(':');
    sessionDate.setHours(parseInt(sessionTime[0]), parseInt(sessionTime[1]));
    
    const now = new Date();
    const sessionEndTime = new Date(sessionDate);
    sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (session.duration || 60));

    if (now < sessionDate) {
      return { text: 'Join Session', disabled: true };
    } else if (now >= sessionDate && now <= sessionEndTime) {
      return { text: 'Join Now', disabled: !session.sessionLink };
    } else {
      return { text: 'Session Ended', disabled: true };
    }
  };

  const renderItem = (item) => (
    <motion.div 
      key={item.id} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      variants={itemVariants}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-primary-600 font-semibold">
            {formatDate(item.date)}
          </div>
          <div className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
            item.type === 'webinar' 
              ? 'bg-primary-100 text-primary-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {item.type === 'webinar' ? item.category : 'Mentoring Session'}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.type === 'webinar' ? item.title : `Session with ${item.mentorName}`}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {item.type === 'webinar' ? item.description : item.topic}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FiUser className="mr-2 h-4 w-4" />
          {item.type === 'webinar' ? item.presenter : item.mentorName}
        </div>

        {item.type === 'session' && item.mentorExpertise && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <FiBriefcase className="mr-2 h-4 w-4" />
            {item.mentorExpertise}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <FiClock className="mr-2 h-4 w-4" />
            {item.time} ({item.duration || 60} min)
          </div>
          <div className="flex items-center">
            <FiVideo className="mr-2 h-4 w-4" />
            {item.type === 'webinar' ? item.platform : 'Online Session'}
          </div>
        </div>
        
        {item.type === 'webinar' ? (
          new Date(item.date) >= currentDate ? (
            <button className="btn-primary w-full">
              Register
            </button>
          ) : item.recordingUrl && (
            <a 
              href={item.recordingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary w-full flex items-center justify-center"
            >
              <FiExternalLink className="mr-2" /> Watch Recording
            </a>
          )
        ) : (
          (() => {
            const status = getSessionStatus(item);
            return (
              <button 
                onClick={() => !status.disabled && handleJoinSession(item)}
                className={`btn-primary w-full ${status.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={status.disabled}
              >
                {status.text}
              </button>
            );
          })()
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen   bg-black  bg-[url('./bg-3.png')] bg-no-repeat bg-cover bg-center py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-100">Events & Sessions</h1>
          <p className="mt-2 text-lg text-gray-300">Enhance your skills with live sessions and Events</p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Item */}
            {upcomingItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-xl overflow-hidden shadow-xl"
              >
                <div className="md:flex">
                  <div className="md:w-2/3 p-8 text-white">
                    <div className="inline-block bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-semibold mb-4">
                      Featured
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                      {upcomingItems[0].type === 'webinar' 
                        ? upcomingItems[0].title 
                        : `Session with ${upcomingItems[0].mentorName}`}
                    </h2>
                    <p className="mb-6 text-white text-opacity-90">
                      {upcomingItems[0].type === 'webinar' 
                        ? upcomingItems[0].description 
                        : upcomingItems[0].topic}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" />
                        <span>{formatDate(upcomingItems[0].date)}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2" />
                        <span>{upcomingItems[0].time}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUser className="mr-2" />
                        <span>
                          {upcomingItems[0].type === 'webinar' 
                            ? upcomingItems[0].presenter 
                            : upcomingItems[0].mentorName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiVideo className="mr-2" />
                        <span>
                          {upcomingItems[0].type === 'webinar' 
                            ? upcomingItems[0].platform 
                            : 'Online Session'}
                        </span>
                      </div>
                    </div>
                    
                    {upcomingItems[0].type === 'webinar' ? (
                      <button className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-md transition-colors duration-300">
                        Register Now
                      </button>
                    ) : (
                      (() => {
                        const status = getSessionStatus(upcomingItems[0]);
                        return (
                          <button 
                            className={`bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-md transition-colors duration-300 ${
                              status.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={status.disabled}
                          >
                            {status.text}
                          </button>
                        );
                      })()
                    )}
                  </div>
                  <div className="md:w-1/3 bg-primary-800 flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <div className="text-5xl font-bold mb-2">
                        {new Date(upcomingItems[0].date).getDate()}
                      </div>
                      <div className="text-xl">
                        {new Date(upcomingItems[0].date).toLocaleString('default', { month: 'long' })}
                      </div>
                      <div className="mt-6 inline-block bg-primary-600 rounded-full px-4 py-2">
                        Upcoming
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Upcoming Items */}
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Upcoming Events</h2>
              
              {upcomingItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming events</h3>
                  <p className="mt-1 text-gray-500">Check back later for new events.</p>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {upcomingItems.slice(1).map(renderItem)}
                </motion.div>
              )}
            </div>
            
            {/* Past Items */}
            {pastItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-100 mb-6">Past Events</h2>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {pastItems.map(renderItem)}
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Webinars;