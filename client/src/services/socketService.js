import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://intervue-2-446p.onrender.com/';
    this.socket = io(serverUrl);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Student methods
  joinAsStudent(name) {
    this.socket?.emit('student-join', name);
  }

  submitAnswer(answer) {
    this.socket?.emit('submit-answer', answer);
  }

  // Teacher methods
  createPoll(pollData) {
    this.socket?.emit('create-poll', pollData);
  }

  getResults() {
    this.socket?.emit('get-results');
  }

  // Event listeners
  onNewQuestion(callback) {
    this.socket?.on('new-question', callback);
  }

  onShowResults(callback) {
    this.socket?.on('show-results', callback);
  }

  onPollEnded(callback) {
    this.socket?.on('poll-ended', callback);
  }

  onStudentsUpdate(callback) {
    this.socket?.on('students-update', callback);
  }

  onPollCreationError(callback) {
    this.socket?.on('poll-creation-error', callback);
  }
}

export default new SocketService();
