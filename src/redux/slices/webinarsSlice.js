import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const fetchWebinarsAndSessions = createAsyncThunk(
  'webinars/fetchWebinarsAndSessions',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch webinars
      const webinarsQuery = query(collection(db, 'webinars'), orderBy('date', 'desc'));
      const webinarsSnapshot = await getDocs(webinarsQuery);
      const webinars = webinarsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'webinar'
      }));

      // Fetch sessions
      const sessionsQuery = query(collection(db, 'sessions'), orderBy('date', 'desc'));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      // Fetch mentor details for each session
      const sessions = await Promise.all(sessionsSnapshot.docs.map(async (docSnapshot) => {
        const sessionData = docSnapshot.data();
        let mentorData = null;
        
        if (sessionData.mentorId) {
          const mentorDoc = await getDoc(doc(db, 'mentors', sessionData.mentorId));
          if (mentorDoc.exists()) {
            mentorData = mentorDoc.data();
          }
        }
        
        return {
          id: docSnapshot.id,
          ...sessionData,
          mentorName: mentorData?.name || 'Unknown Mentor',
          mentorExpertise: mentorData?.expertise || '',
          type: 'session'
        };
      }));

      // Combine and sort by date
      const combined = [...webinars, ...sessions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      return combined;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addWebinar = createAsyncThunk(
  'webinars/addWebinar',
  async (webinarData, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'webinars'), {
        ...webinarData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...webinarData, type: 'webinar' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWebinar = createAsyncThunk(
  'webinars/updateWebinar',
  async ({ id, ...webinarData }, { rejectWithValue }) => {
    try {
      const webinarRef = doc(db, 'webinars', id);
      await updateDoc(webinarRef, webinarData);
      return { id, ...webinarData, type: 'webinar' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWebinar = createAsyncThunk(
  'webinars/deleteWebinar',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'webinars', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const webinarsSlice = createSlice({
  name: 'webinars',
  initialState,
  reducers: {
    clearWebinarsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Webinars and Sessions
      .addCase(fetchWebinarsAndSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebinarsAndSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWebinarsAndSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Webinar
      .addCase(addWebinar.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update Webinar
      .addCase(updateWebinar.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Webinar
      .addCase(deleteWebinar.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearWebinarsError } = webinarsSlice.actions;
export default webinarsSlice.reducer;