import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentQuestion, setResults, setHasAnswered, setTimeRemaining, endPoll } from '../store/pollSlice';
import { logout } from '../store/userSlice';
import socketService from '../services/socketService';
import ChatPopup from './ChatPopup';
import KickedOutScreen from './KickedOutScreen';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { name } = useSelector((state) => state.user);
  const { currentQuestion, results, hasAnswered, showResults, timeRemaining } = useSelector((state) => state.poll);
  const [showChat, setShowChat] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState('waiting'); // 'waiting', 'answering', 'results', 'kicked-out'

  useEffect(() => {
    // Join as student when component mounts
    if (name) {
      socketService.joinAsStudent(name);
    }

    // Listen for socket events
    socketService.onNewQuestion((questionData) => {
      dispatch(setCurrentQuestion(questionData));
      setSelectedAnswer('');
      setCurrentStep('answering');
    });

    socketService.onShowResults((data) => {
      dispatch(setResults(data));
      dispatch(setHasAnswered(true));
      setCurrentStep('results');
    });

    socketService.onPollEnded((data) => {
      dispatch(setResults(data));
      dispatch(endPoll());
      setCurrentStep('results');
    });

    // Handle being kicked out by teacher
    const handleKickedOut = (data) => {
      setCurrentStep('kicked-out');
      // Close chat if open
      setShowChat(false);
    };

    socketService.socket?.on('student-kicked-out', handleKickedOut);

    return () => {
      socketService.socket?.off('student-kicked-out', handleKickedOut);
    };
  }, [dispatch, name]);

  // Timer countdown
  useEffect(() => {
    if (currentQuestion && !hasAnswered && timeRemaining > 0) {
      const timer = setInterval(() => {
        dispatch(setTimeRemaining(timeRemaining - 1));
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && currentStep === 'answering') {
      setCurrentStep('results');
    }
  }, [currentQuestion, hasAnswered, timeRemaining, dispatch, currentStep]);

  const handleSubmitAnswer = () => {
    if (selectedAnswer && !hasAnswered) {
      socketService.submitAnswer(selectedAnswer);
      dispatch(setHasAnswered(true));
      setCurrentStep('results');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chat handler
  const handleChatClick = () => {
    setShowChat(true);
  };

  const handleChatClose = () => {
    setShowChat(false);
  };

  // Handle try again after being kicked out
  const handleTryAgain = () => {
    // Clear user data and redirect to role selection
    dispatch(logout());
    socketService.disconnect();
    window.location.reload();
  };

  // Kicked Out Screen
  const renderKickedOutScreen = () => (
    <KickedOutScreen onTryAgain={handleTryAgain} />
  );

  // Waiting Screen
  const renderWaitingScreen = () => (
    <div className="waiting-screen">
      <div className="waiting-container">
        <div className="header-badge">
          <span className="poll-icon">✨</span>
          <span>Intervue Poll</span>
        </div>
        
        <div className="loading-spinner"></div>
        <h2>Wait for the teacher to ask questions..</h2>
        
        <div className="chat-button" onClick={handleChatClick}>
          <span className="chat-icon">💬</span>
        </div>
      </div>
      
      <ChatPopup isOpen={showChat} onClose={handleChatClose} />
    </div>
  );

  // Question Answering Screen
  const renderQuestionScreen = () => (
    <div className="question-screen">
      <div className="question-container">
        <div className="question-header">
          <span className="question-number">Question 1</span>
          <div className="timer-badge">
            <span className="timer-icon">⏱</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="question-content">
          <h2>{currentQuestion?.question}</h2>
          
          <div className="options-list">
            {currentQuestion?.options.map((option, index) => (
              <label key={index} className="option-item">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={timeRemaining === 0}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>

          <button
            className={`submit-btn ${selectedAnswer ? 'active' : ''}`}
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || timeRemaining === 0}
          >
            Submit
          </button>
        </div>

        <div className="chat-button" onClick={handleChatClick}>
          <span className="chat-icon">💬</span>
        </div>
      </div>
      
      <ChatPopup isOpen={showChat} onClose={handleChatClose} />
    </div>
  );

  // Results Screen
  const renderResultsScreen = () => (
    <div className="results-screen">
      <div className="results-container">
        <h2>Poll Results</h2>
        <div className="question-display">{currentQuestion?.question}</div>
        
        <div className="results-chart">
          {currentQuestion?.options.map((option) => {
            const votes = results[option] || 0;
            const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            
            return (
              <div key={option} className="result-item">
                <div className="option-header">
                  <span className="option-text">{option}</span>
                  <span className="vote-info">{votes} votes ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="total-votes">
          Total Responses: {Object.values(results).reduce((sum, count) => sum + count, 0)}
        </div>
        
        <div className="chat-button" onClick={handleChatClick}>
          <span className="chat-icon">💬</span>
        </div>
      </div>
      
      <ChatPopup isOpen={showChat} onClose={handleChatClose} />
    </div>
  );

  // Render based on current step
  if (currentStep === 'kicked-out') {
    return renderKickedOutScreen();
  }

  if (currentStep === 'waiting') {
    return renderWaitingScreen();
  }

  if (currentStep === 'answering' && currentQuestion) {
    return renderQuestionScreen();
  }

  if (currentStep === 'results' && showResults) {
    return renderResultsScreen();
  }

  // Default to waiting screen
  return renderWaitingScreen();
};

export default StudentDashboard;
