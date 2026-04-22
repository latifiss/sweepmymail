import { createSlice } from '@reduxjs/toolkit';

interface MusicState {
  loading: boolean;
  error: string | null;
}

const initialState: MusicState = {
  loading: false,
  error: null,
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    createMusicStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createMusicSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    createMusicFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateMusicStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateMusicSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateMusicFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteMusicStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteMusicSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    deleteMusicFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createMusicStart,
  createMusicSuccess,
  createMusicFailure,
  updateMusicStart,
  updateMusicSuccess,
  updateMusicFailure,
  deleteMusicStart,
  deleteMusicSuccess,
  deleteMusicFailure,
} = musicSlice.actions;

export default musicSlice.reducer;