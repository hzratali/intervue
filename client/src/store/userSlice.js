import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  role: '', // 'teacher' or 'student'
  isLoggedIn: false,
  students: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.isLoggedIn = true;
    },
    setStudents: (state, action) => {
      state.students = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { setUser, setStudents, logout } = userSlice.actions;
export default userSlice.reducer;
