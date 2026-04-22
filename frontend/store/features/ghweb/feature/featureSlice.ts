import { createSlice } from '@reduxjs/toolkit';

interface FeatureState {
  loading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  loading: false,
  error: null,
};

const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    createFeatureStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createFeatureSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    createFeatureFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFeatureStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateFeatureSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateFeatureFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteFeatureStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteFeatureSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    deleteFeatureFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createFeatureStart,
  createFeatureSuccess,
  createFeatureFailure,
  updateFeatureStart,
  updateFeatureSuccess,
  updateFeatureFailure,
  deleteFeatureStart,
  deleteFeatureSuccess,
  deleteFeatureFailure,
} = featureSlice.actions;

export default featureSlice.reducer;