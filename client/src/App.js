import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import RoleSelection from './components/RoleSelection';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import { useSelector } from 'react-redux';
import socketService from './services/socketService';
import './App.css';

function AppContent() {
  const { isLoggedIn, role } = useSelector((state) => state.user);

  useEffect(() => {
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  if (!isLoggedIn) {
    return <RoleSelection />;
  }

  return (
    <div className="App">
      {role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;