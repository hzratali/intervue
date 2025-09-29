const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || ["https://intervue-h7f7.vercel.app/"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || ["https://intervue-h7f7.vercel.app/"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));


// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Live Polling System API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Store active polls, students, teacher, and chat messages
let currentPoll = null;
let students = new Map(); // studentId -> {name, hasAnswered, answer}
let teacherInfo = null; // Store teacher information
let pollResults = {};
let chatMessages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Student joins
  socket.on('student-join', (studentName) => {
    students.set(socket.id, {
      name: studentName,
      hasAnswered: false,
      answer: null
    });
    
    // Send current poll if exists
    if (currentPoll) {
      socket.emit('new-question', currentPoll);
    }
    
    // Update student list for teacher
    io.emit('students-update', Array.from(students.values()).map(s => s.name));
  });

  // Teacher creates poll
  socket.on('create-poll', (pollData) => {
    // Store teacher information when they create a poll
    teacherInfo = {
      socketId: socket.id,
      name: 'Teacher',
      role: 'teacher'
    };

    const canCreatePoll = !currentPoll || 
                         Array.from(students.values()).every(student => student.hasAnswered);
    
    if (canCreatePoll) {
      currentPoll = {
        question: pollData.question,
        options: pollData.options,
        timeLimit: pollData.timeLimit || 60,
        startTime: Date.now()
      };
      
      // Reset student answers
      students.forEach(student => {
        student.hasAnswered = false;
        student.answer = null;
      });
      
      pollResults = {};
      
      // Broadcast new question to all students
      io.emit('new-question', currentPoll);
      
      // Auto-end poll after time limit
      setTimeout(() => {
        if (currentPoll) {
          endCurrentPoll();
        }
      }, currentPoll.timeLimit * 1000);
      
    } else {
      socket.emit('poll-creation-error', 'Cannot create poll: previous poll still active');
    }
  });

  // Student submits answer
  socket.on('submit-answer', (answer) => {
    if (currentPoll && students.has(socket.id)) {
      const student = students.get(socket.id);
      if (!student.hasAnswered) {
        student.hasAnswered = true;
        student.answer = answer;
        
        // Update poll results
        pollResults[answer] = (pollResults[answer] || 0) + 1;
        
        // Send results to this student
        socket.emit('show-results', {
          results: pollResults,
          question: currentPoll.question,
          options: currentPoll.options
        });
        
        // Check if all students answered
        const allAnswered = Array.from(students.values()).every(s => s.hasAnswered);
        if (allAnswered) {
          endCurrentPoll();
        }
      }
    }
  });

  // Teacher requests results
  socket.on('get-results', () => {
    if (currentPoll) {
      socket.emit('show-results', {
        results: pollResults,
        question: currentPoll.question,
        options: currentPoll.options
      });
    }
  });

  // ===== CHAT FUNCTIONALITY =====
  
  // Chat functionality
  socket.on('send-message', (messageData) => {
    const message = {
      id: Date.now(),
      name: messageData.name,
      message: messageData.message,
      timestamp: new Date().toISOString(),
      socketId: socket.id
    };
    
    chatMessages.push(message);
    
    // Broadcast message to all connected users
    io.emit('new-message', message);
  });

  // Send chat history to new users
  socket.on('get-chat-history', () => {
    socket.emit('chat-history', chatMessages);
  });

  // Clear chat (teacher only)
  socket.on('clear-chat', () => {
    chatMessages = [];
    io.emit('chat-cleared');
  });

  // ===== KICK STUDENT FUNCTIONALITY =====
  
  // Teacher kicks out student
  socket.on('kick-student', (studentSocketId) => {
    // Find and remove the student
    if (students.has(studentSocketId)) {
      const studentName = students.get(studentSocketId).name;
      students.delete(studentSocketId);
      
      // Notify the kicked student
      io.to(studentSocketId).emit('student-kicked-out', {
        message: 'You have been removed from the session by the teacher.'
      });
      
      // Force disconnect the student
      const studentSocket = io.sockets.sockets.get(studentSocketId);
      if (studentSocket) {
        studentSocket.disconnect(true);
      }
      
      // Update student list for everyone
      io.emit('students-update', Array.from(students.values()).map(s => s.name));
      
      console.log(`Student ${studentName} was kicked out by teacher`);
    }
  });

  // Get students with socket IDs - UPDATED to include teacher
  socket.on('get-students-with-ids', () => {
    const studentsWithIds = Array.from(students.entries()).map(([socketId, student]) => ({
      socketId,
      name: student.name,
      hasAnswered: student.hasAnswered,
      role: 'student'
    }));
    
    // Include teacher if they exist
    const allParticipants = teacherInfo ? [teacherInfo, ...studentsWithIds] : studentsWithIds;
    
    socket.emit('students-with-ids', allParticipants);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    // Clear teacher info if teacher disconnects
    if (teacherInfo && teacherInfo.socketId === socket.id) {
      teacherInfo = null;
      console.log('Teacher disconnected');
    }
    
    // Remove student if student disconnects
    students.delete(socket.id);
    io.emit('students-update', Array.from(students.values()).map(s => s.name));
    console.log('User disconnected:', socket.id);
  });
});

function endCurrentPoll() {
  io.emit('poll-ended', {
    results: pollResults,
    question: currentPoll.question,
    options: currentPoll.options
  });
  
  // Don't reset currentPoll immediately to maintain state
  setTimeout(() => {
    currentPoll = null;
  }, 5000);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
