import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setResults, endPoll, setCurrentQuestion } from '../store/pollSlice'; // Added setCurrentQuestion
import { setStudents } from '../store/userSlice';
import socketService from '../services/socketService';
import ChatPopup from './ChatPopup';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { name } = useSelector((state) => state.user);
  const { currentQuestion, results, showResults } = useSelector((state) => state.poll);
  const { students } = useSelector((state) => state.user);
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('create'); // 'create', 'active', 'results'
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Connect to socket when component mounts - THIS WAS MISSING!
    socketService.connect();

    // Listen for poll creation success - THIS WAS MISSING!
    const handleNewQuestion = (questionData) => {
      console.log('Poll created successfully:', questionData);
      dispatch(setCurrentQuestion(questionData));
    };

    // Listen for socket events
    const handleShowResults = (data) => {
      console.log('Received results:', data);
      dispatch(setResults(data));
      setCurrentStep('results');
    };

    const handlePollEnded = (data) => {
      console.log('Poll ended:', data);
      dispatch(setResults(data));
      dispatch(endPoll());
      setCurrentStep('results');
    };

    const handleStudentsUpdate = (studentsList) => {
      dispatch(setStudents(studentsList));
    };

    const handlePollCreationError = (errorMsg) => {
      setError(errorMsg);
    };

    // Set up socket listeners
    socketService.socket?.on('new-question', handleNewQuestion);
    socketService.onShowResults(handleShowResults);
    socketService.onPollEnded(handlePollEnded);
    socketService.onStudentsUpdate(handleStudentsUpdate);
    socketService.onPollCreationError(handlePollCreationError);

    // Cleanup function
    return () => {
      socketService.socket?.off('new-question', handleNewQuestion);
    };
  }, [dispatch]);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    setError('');
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (question.trim() && validOptions.length >= 2) {
      const pollData = {
        question: question.trim(),
        options: validOptions,
        timeLimit: timeLimit
      };
      
      console.log('Creating poll:', pollData);
      socketService.createPoll(pollData);
      setCurrentStep('active');
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setTimeLimit(60);
    } else {
      setError('Please provide a question and at least 2 options');
    }
  };

  const handleGetResults = () => {
    console.log('Requesting results for question:', currentQuestion);
    if (currentQuestion) {
      socketService.getResults();
    } else {
      console.warn('No current question available');
    }
  };

  const handleNewPoll = () => {
    setCurrentStep('create');
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
    setError('');
  };

  // Chat handlers
  const handleChatClick = () => {
    setShowChat(true);
  };

  const handleChatClose = () => {
    setShowChat(false);
  };

  // Create Poll Screen
  const renderCreatePoll = () => (
    <div className="teacher-dashboard">
      <div className="dashboard-container">
        <div className="header-section">
          <div className="header-badge">
            <span className="poll-icon">✨</span>
            <span>Intervue Poll</span>
          </div>
          <h1>Let's Get Started</h1>
          <p className="subtitle">
            you'll have the ability to create and manage polls, ask questions, and monitor 
            your students' responses in real-time.
          </p>
        </div>

        <div className="form-section">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleCreatePoll}>
            <div className="input-group">
              <label className="question-label">Enter your question</label>

              <div className="question-input-container">
                {/* Timer Dropdown - Top Right */}
                <select 
                  value={timeLimit} 
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="time-select"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>2 minutes</option>
                </select>

                {/* Textarea */}
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question..."
                  rows={4}
                  maxLength={100}
                  className="question-input"
                  required
                />

                {/* Character Counter */}
                <span className="char-count">{question.length}/100</span>
              </div>
            </div>

            <div className="options-section">
              <div className="options-header">
                <span>Edit Options</span>
                <span>Is It Correct?</span>
              </div>
              
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <div className="option-input-wrapper">
                    <div className="option-number">{index + 1}</div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder=""
                      className="option-input"
                      required={index < 2}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="remove-option"
                        onClick={() => removeOption(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <div className="correct-options">
                    <label className="radio-option">
                      <input type="radio" name={`correct-${index}`} />
                      <span>Yes</span>
                    </label>
                    <label className="radio-option">
                      <input type="radio" name={`correct-${index}`} defaultChecked />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              ))}
              
              {options.length < 6 && (
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={addOption}
                >
                  + Add More option
                </button>
              )}
            </div>

            <button type="submit" className="ask-question-btn">
              Ask Question
            </button>
          </form>
        </div>

        <div className="students-section">
          <h3>Connected Students ({students.length})</h3>
          <div className="students-grid">
            {students.length === 0 ? (
              <p>No students connected</p>
            ) : (
              students.map((student, index) => (
                <div key={index} className="student-card">
                  <div className="student-avatar">
                    {student.charAt(0).toUpperCase()}
                  </div>
                  <span>{student}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="chat-button" onClick={handleChatClick}>
        <span className="chat-icon">💬</span>
      </div>

      <ChatPopup isOpen={showChat} onClose={handleChatClose} />
    </div>
  );

  // Active Poll Screen
  const renderActivePoll = () => (
    <div className="teacher-dashboard">
      <div className="dashboard-container">
        <div className="active-poll-header">
          <div className="header-badge">
            <span className="poll-icon">✨</span>
            <span>Intervue Poll</span>
          </div>
          <h2>Poll is Active</h2>
          <p>Students are currently answering your question</p>
        </div>

        <div className="poll-status">
          <div className="current-question">
            <h3>Current Question:</h3>
            <p>{currentQuestion?.question}</p>
          </div>
          
          <div className="poll-options">
            {currentQuestion?.options?.map((option, index) => (
              <div key={index} className="poll-option">
                {index + 1}. {option}
              </div>
            ))}
          </div>

          <div className="poll-actions">
            <button onClick={handleGetResults} className="view-results-btn">
              View Results
            </button>
            <button onClick={handleNewPoll} className="new-poll-btn">
              Create New Poll
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="chat-button" onClick={handleChatClick}>
        <span className="chat-icon">💬</span>
      </div>

      <ChatPopup isOpen={showChat} onClose={handleChatClose} />
    </div>
  );

  // Results Screen  
  const renderResults = () => (
    <div className="teacher-dashboard">
      <div className="dashboard-container">
        <div className="results-header">
          <div className="header-badge">
            <span className="poll-icon">✨</span>
            <span>Intervue Poll</span>
          </div>
          <h2>Poll Results</h2>
        </div>

        <div className="results-content">
          <div className="question-display">{currentQuestion?.question}</div>
          
          <div className="results-chart">
            {currentQuestion?.options?.map((option, index) => {
              const votes = results[option] || 0;
              const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              
              return (
                <div key={option} className="result-bar">
                  <div className="result-header">
                    <span className="option-text">{index + 1}. {option}</span>
                    <span className="vote-count">{votes} votes ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-footer">
            <div className="total-responses">
              Total Responses: {Object.values(results).reduce((sum, count) => sum + count, 0)}
            </div>
            <button onClick={handleNewPoll} className="new-poll-btn">
              Create New Poll
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="chat-button" onClick={handleChatClick}>
        <span className="chat-icon">💬</span>
      </div>

      <ChatPopup isOpen={showChat} onClose={handleChatClose} />
    </div>
  );

  // Render based on current step
  if (currentStep === 'create') {
    return renderCreatePoll();
  }

  if (currentStep === 'active') {
    return renderActivePoll();
  }

  if (currentStep === 'results' && showResults && currentQuestion) {
    return renderResults();
  }

  // Default to create poll
  return renderCreatePoll();
};

export default TeacherDashboard;
