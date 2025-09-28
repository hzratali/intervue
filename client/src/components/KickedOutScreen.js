import React from 'react';
import './KickedOutScreen.css';

const KickedOutScreen = ({ onTryAgain }) => {
  return (
    <div className="kicked-out-screen">
      <div className="kicked-out-container">
        <div className="header-badge">
          <span className="poll-icon">✨</span>
          <span>Intervue Poll</span>
        </div>
        
        <h1>You've been Kicked out!</h1>
        <p className="subtitle">
          Looks like the teacher has removed you from the poll system. Please 
          Try again sometime.
        </p>

        <button className="try-again-btn" onClick={onTryAgain}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default KickedOutScreen;
