import { configureStore } from '@reduxjs/toolkit';
import pollSlice from './pollSlice';
import userSlice from './userSlice';

export const store = configureStore({
  reducer: {
    poll: pollSlice,
    user: userSlice,
  },
});
