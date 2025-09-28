import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';
import './ChatPopup.css';

const ChatPopup = ({ isOpen, onClose }) => {
  const { name, role } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Get chat history when popup opens
      if (socketService.socket) {
        socketService.socket.emit('get-chat-history');
        socketService.socket.emit('get-students-with-ids');
      }

      const handleNewMessage = (messageData) => {
        console.log('New message received:', messageData);
        setMessages(prev => [...prev, messageData]);
      };

      const handleChatHistory = (history) => {
        console.log('Chat history received:', history);
        setMessages(history || []);
      };

      const handleChatCleared = () => {
        console.log('Chat cleared');
        setMessages([]);
      };

      const handleStudentsWithIds = (studentsData) => {
        console.log('Students with IDs received:', studentsData);
        setAllParticipants(studentsData || []);
      };

      // Set up listeners
      if (socketService.socket) {
        socketService.socket.on('new-message', handleNewMessage);
        socketService.socket.on('chat-history', handleChatHistory);
        socketService.socket.on('chat-cleared', handleChatCleared);
        socketService.socket.on('students-with-ids', handleStudentsWithIds);
      }

      return () => {
        if (socketService.socket) {
          socketService.socket.off('new-message', handleNewMessage);
          socketService.socket.off('chat-history', handleChatHistory);
          socketService.socket.off('chat-cleared', handleChatCleared);
          socketService.socket.off('students-with-ids', handleStudentsWithIds);
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && name && socketService.socket) {
      const messageData = {
        name: name,
        message: message.trim(),
        role: role
      };

      console.log('Sending message:', messageData);
      socketService.socket.emit('send-message', messageData);
      setMessage('');
    }
  };

  const handleClearChat = () => {
    if (role === 'teacher' && socketService.socket) {
      socketService.socket.emit('clear-chat');
    }
  };

  const handleKickStudent = (studentSocketId, studentName) => {
    if (role === 'teacher' && window.confirm(`Are you sure you want to kick out ${studentName}?`)) {
      if (socketService.socket) {
        socketService.socket.emit('kick-student', studentSocketId);
      }
      // Remove from local state immediately for better UX
      setAllParticipants(prev => prev.filter(s => s.socketId !== studentSocketId));
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay">
      <div className="chat-popup">
        <div className="chat-header">
          <div className="chat-tabs">
            <button
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-content">
          {activeTab === 'chat' ? (
            <>
              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">💬</div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.name === name ? 'own-message' : 'other-message'}`}
                    >
                      <div className="message-header">
                        <span className="sender-name">{msg.name}</span>
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="message-content">{msg.message}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <div className="chat-input-container">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="chat-input"
                    maxLength={500}
                    disabled={!socketService.socket || !socketService.socket.connected}
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!message.trim() || !socketService.socket || !socketService.socket.connected}
                  >
                    <span className="send-icon">➤</span>
                  </button>
                </div>
                {!socketService.socket || !socketService.socket.connected && (
                  <div className="connection-status">
                    <span className="offline-indicator">⚠️ Connecting...</span>
                  </div>
                )}
              </form>

              {/* Clear Chat Button for Teacher */}
              {role === 'teacher' && messages.length > 0 && (
                <button className="clear-chat-btn" onClick={handleClearChat}>
                  Clear Chat
                </button>
              )}
            </>
          ) : (
            /* Participants Tab */
            <div className="participants-list">
              <div className="participants-header">
                <h3>Participants ({allParticipants.length})</h3>
                {role === 'teacher' && <h3>Actions</h3>}
              </div>
              <div className="participants-content">
                {/* Show current user first with (You) indicator */}
                <div className={`participant-item current-user ${role === 'teacher' ? 'teacher-item' : ''}`}>
                  <div className="participant-info-container">
                    <div className={`participant-avatar ${role === 'teacher' ? 'teacher-avatar' : ''}`}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">{name} (You)</span>
                      <span className="participant-role">{role === 'teacher' ? 'Teacher' : 'Student'}</span>
                    </div>
                  </div>
                </div>

                {/* Show all other participants */}
                {allParticipants
                  .filter(participant => participant.name !== name)
                  .map((participant) => (
                    <div key={participant.socketId} className="participant-item">
                      <div className="participant-info-container">
                        <div className="participant-avatar">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="participant-info">
                          <span className="participant-name">{participant.name}</span>
                          <span className="participant-role">
                            {participant.role === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                        </div>
                      </div>
                      {role === 'teacher' && participant.role !== 'teacher' && (
                        <button
                          className="kick-out-btn"
                          onClick={() => handleKickStudent(participant.socketId, participant.name)}
                          title={`Kick out ${participant.name}`}
                        >
                          Kick out
                        </button>
                      )}
                    </div>
                  ))}

                {allParticipants.filter(p => p.name !== name).length === 0 && (
                  <div className="no-participants">
                    <div className="no-participants-icon">👥</div>
                    <p>No other participants yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;