import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import './RoleSelection.css';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'teacher') {
      // Skip name entry for teacher and go directly to dashboard
      dispatch(setUser({ name: 'Teacher', role: 'teacher' }));
    } else if (selectedRole === 'student') {
      // Show name entry for students
      setShowNameEntry(true);
    }
  };

  const handleNameSubmit = () => {
    if (name.trim() && selectedRole) {
      dispatch(setUser({ name: name.trim(), role: selectedRole }));
    }
  };

  // Name Entry Screen (Let's Get Started) - Only for Students
  if (showNameEntry && selectedRole === 'student') {
    return (
      <div className="role-selection">
        <div className="role-selection-container">
          <div className="header-badge">
            <span className="poll-icon">✨</span>
            <span>Intervue Poll</span>
          </div>
          
          <h1>Let's Get Started</h1>
          <p className="subtitle">
            If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates
          </p>

          <div className="name-input-section">
            <label>Enter your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="name-input"
              autoFocus
            />
          </div>

          <button
            className={`continue-btn ${name.trim() ? 'active' : ''}`}
            onClick={handleNameSubmit}
            disabled={!name.trim()}
          >
            Continue
          </button>

          <button
            className="back-btn"
            onClick={() => setShowNameEntry(false)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Role Selection Screen
  return (
    <div className="role-selection">
      <div className="role-selection-container">
        <div className="header-badge">
          <span className="poll-icon">✨</span>
          <span>Intervue Poll</span>
        </div>
        
        <h1>Welcome to the Live Polling System</h1>
        <p className="subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-cards">
          <div 
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <div className="role-card-content">
              <h3>I'm a Student</h3>
              <p>Submit answers and participate in live polls with your classmates</p>
            </div>
          </div>

          <div 
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <div className="role-card-content">
              <h3>I'm a Teacher</h3>
              <p>Create polls, ask questions, and view live poll results in real-time</p>
            </div>
          </div>
        </div>

        <button
          className={`continue-btn ${selectedRole ? 'active' : ''}`}
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
