import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSearch, FiCalendar, FiClock, FiUser, FiLink } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const SessionsCRUD = () => {
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchSessions();
    fetchMentors();
    fetchStudents();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const sessionsList = [];
      for (const docSnapshot of querySnapshot.docs) {
        const sessionData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Get mentor details
        if (sessionData.mentorId) {
          const mentorDoc = await getDoc(doc(db, 'mentors', sessionData.mentorId));
          if (mentorDoc.exists()) {
            const mentorData = mentorDoc.data();
            sessionData.mentorName = mentorData.name;
            sessionData.mentorExpertise = mentorData.expertise;
          }
        }
        
        // Get student details
        if (sessionData.studentId) {
          const studentDoc = await getDoc(doc(db, 'users', sessionData.studentId));
          if (studentDoc.exists()) {
            sessionData.studentName = studentDoc.data().displayName;
          }
        }
        
        sessionsList.push(sessionData);
      }
      
      setSessions(sessionsList);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'mentors'));
      const mentorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMentors(mentorsList);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      
      const studentsList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student');
      
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const openModal = (session = null) => {
    setCurrentSession(session);
    
    if (session) {
      // Edit mode - populate form
      setValue('mentorId', session.mentorId);
      setValue('studentId', session.studentId);
      setValue('date', formatDateForInput(session.date));
      setValue('time', session.time);
      setValue('duration', session.duration);
      setValue('topic', session.topic);
      setValue('status', session.status);
      setValue('notes', session.notes || '');
      setValue('sessionLink', session.sessionLink || '');
    } else {
      // Add mode - reset form
      reset({
        mentorId: '',
        studentId: '',
        date: '',
        time: '',
        duration: 60,
        topic: '',
        status: 'scheduled',
        notes: '',
        sessionLink: '',
      });
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSession(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const sessionData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      if (currentSession) {
        // Update existing session
        await updateDoc(doc(db, 'sessions', currentSession.id), sessionData);
      } else {
        // Add new session
        sessionData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'sessions'), sessionData);
      }
      
      // Refresh sessions list
      await fetchSessions();
      closeModal();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'sessions', id));
        setSessions(sessions.filter(session => session.id !== id));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => 
    (session.mentorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Sessions</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Schedule Session
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sessions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.mentorName || 'Unknown Mentor'}</div>
                      {session.mentorExpertise && (
                        <div className="text-sm text-gray-500">{session.mentorExpertise}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.studentName || 'Unknown Student'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(session.date)}</div>
                      <div className="text-sm text-gray-500">{session.time} ({session.duration} min)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{session.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(session)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-purple-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {currentSession ? 'Edit Session' : 'Schedule New Session'}
              </h3>
              <button onClick={closeModal} className="text-white hover:text-gray-200">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="mentorId" className="block text-sm font-medium text-gray-700 mb-1">
                    Mentor *
                  </label>
                  <select
                    id="mentorId"
                    {...register('mentorId', { required: 'Mentor is required' })}
                    className="input-field"
                  >
                    <option value="">Select a mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name} - {mentor.expertise}
                      </option>
                    ))}
                  </select>
                  {errors.mentorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.mentorId.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    id="studentId"
                    {...register('studentId', { required: 'Student is required' })}
                    className="input-field"
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.displayName} - {student.email}
                      </option>
                    ))}
                  </select>
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="date"
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="time"
                      type="time"
                      {...register('time', { required: 'Time is required' })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    {...register('duration', { 
                      required: 'Duration is required',
                      min: {
                        value: 15,
                        message: 'Duration must be at least 15 minutes'
                      }
                    })}
                    className="input-field"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    {...register('status', { required: 'Status is required' })}
                    className="input-field"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <input
                    id="topic"
                    type="text"
                    {...register('topic', { required: 'Topic is required' })}
                    className="input-field"
                    placeholder="e.g., Career Guidance, Technical Interview Prep"
                  />
                  {errors.topic && (
                    <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="sessionLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLink className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="sessionLink"
                      type="url"
                      {...register('sessionLink')}
                      className="input-field pl-10"
                      placeholder="https://topmate.io/your_session_link"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the Topmate.io session link where students can join the session
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    className="input-field"
                    placeholder="Any additional information about the session"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {currentSession ? 'Update Session' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SessionsCRUD;