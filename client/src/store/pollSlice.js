import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuestion: null,
  results: {},
  isActive: false,
  timeRemaining: 0,
  hasAnswered: false,
  showResults: false,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
      state.isActive = true;
      state.hasAnswered = false;
      state.showResults = false;
      state.timeRemaining = action.payload.timeLimit;
    },
    setResults: (state, action) => {
      state.results = action.payload.results;
      state.showResults = true;
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    endPoll: (state) => {
      state.isActive = false;
      state.showResults = true;
    },
    resetPoll: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentQuestion,
  setResults,
  setHasAnswered,
  setTimeRemaining,
  endPoll,
  resetPoll,
} = pollSlice.actions;

export default pollSlice.reducer;
