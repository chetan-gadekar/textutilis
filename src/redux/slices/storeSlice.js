import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/stores';

const initialState = {
  stores: [],
  store: null,
  ownerStores: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all stores
export const getStores = createAsyncThunk(
  'stores/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
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

// Get single store
export const getStore = createAsyncThunk(
  'stores/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
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

// Get stores by owner
export const getStoresByOwner = createAsyncThunk(
  'stores/getByOwner',
  async (ownerId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.get(`${API_URL}/owner/${ownerId}`, config);
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

// Create new store (admin only)
export const createStore = createAsyncThunk(
  'stores/create',
  async (storeData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.post(API_URL, storeData, config);
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

// Update store
export const updateStore = createAsyncThunk(
  'stores/update',
  async ({ id, storeData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.put(`${API_URL}/${id}`, storeData, config);
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

// Delete store (admin only)
export const deleteStore = createAsyncThunk(
  'stores/delete',
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

export const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    resetStore: (state) => {
      state.store = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStores.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stores = action.payload;
      })
      .addCase(getStores.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.store = action.payload;
      })
      .addCase(getStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getStoresByOwner.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStoresByOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ownerStores = action.payload;
      })
      .addCase(getStoresByOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stores.push(action.payload);
      })
      .addCase(createStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stores = state.stores.map((store) => 
          store._id === action.payload._id ? action.payload : store
        );
        state.store = action.payload;
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stores = state.stores.filter((store) => store._id !== action.payload);
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetStore } = storeSlice.actions;
export default storeSlice.reducer; 