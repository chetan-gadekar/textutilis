import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ratings';

const initialState = {
  ratings: [],
  userRating: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get store ratings
export const getStoreRatings = createAsyncThunk(
  'ratings/getStoreRatings',
  async (storeId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/store/${storeId}`);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user's rating for a store
export const getUserStoreRating = createAsyncThunk(
  'ratings/getUserStoreRating',
  async ({ userId, storeId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.get(`${API_URL}/user/${userId}/store/${storeId}`, config);
      return response.data;
    } catch (error) {
      // If it's a 404 error, it likely means the user hasn't rated this store yet
      // We don't want to show an error for this case
      if (error.response && error.response.status === 404) {
        return null;  // Just return null instead of rejecting
      }
      
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create rating
export const createRating = createAsyncThunk(
  'ratings/createRating',
  async (ratingData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.post(API_URL, ratingData, config);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update rating
export const updateRating = createAsyncThunk(
  'ratings/updateRating',
  async ({ id, ratingData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.put(`${API_URL}/${id}`, ratingData, config);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete rating
export const deleteRating = createAsyncThunk(
  'ratings/deleteRating',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const ratingSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    resetUserRating: (state) => {
      state.userRating = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStoreRatings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStoreRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings = action.payload;
      })
      .addCase(getStoreRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getUserStoreRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserStoreRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userRating = action.payload;
      })
      .addCase(getUserStoreRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings.push(action.payload);
        state.userRating = action.payload;
      })
      .addCase(createRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings = state.ratings.map((rating) => 
          rating._id === action.payload._id ? action.payload : rating
        );
        state.userRating = action.payload;
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings = state.ratings.filter((rating) => rating._id !== action.payload);
        state.userRating = null;
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetUserRating } = ratingSlice.actions;
export default ratingSlice.reducer; 