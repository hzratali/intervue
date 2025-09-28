# Live Polling System

A real-time polling application built for educational environments, enabling teachers to create interactive polls and students to participate in live Q&A sessions with integrated chat functionality.

## Features

### For Teachers
- **Poll Management**: Create polls with multiple choice questions and customizable time limits (30s - 2 minutes)
- **Real-time Results**: View live poll results with percentage breakdowns and vote counts
- **Student Management**: Monitor connected students and remove disruptive participants
- **Chat Moderation**: Clear chat messages and manage classroom discussions

### For Students
- **Live Participation**: Join polls instantly and submit answers in real-time
- **Result Viewing**: See poll results immediately after submission
- **Interactive Chat**: Communicate with classmates and teachers during sessions
- **Responsive Interface**: Optimized for both desktop and mobile devices

### Shared Features
- **Real-time Chat**: Integrated messaging system with message history
- **Participant List**: View all connected users with role indicators
- **Connection Status**: Visual indicators for connection health
- **Auto-reconnection**: Handles network interruptions gracefully

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **CORS** enabled for cross-origin requests
- **Environment variables** for configuration

### Frontend
- **React** with functional components and hooks
- **Redux Toolkit** for state management
- **Socket.IO Client** for real-time updates
- **CSS Modules** for component styling

## Project Structure

```
live-polling-system/
├── server/
│   ├── index.js                 # Main server file
│   ├── package.json            # Server dependencies
│   └── .env                    # Server environment variables
├── client/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── RoleSelection.js
│   │   │   ├── TeacherDashboard.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── ChatPopup.js
│   │   │   └── KickedOutScreen.js
│   │   ├── services/
│   │   │   └── socketService.js # Socket.IO client service
│   │   ├── store/              # Redux store configuration
│   │   └── App.js              # Main app component
│   ├── package.json            # Client dependencies
│   └── .env                    # Client environment variables
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in server directory
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in client directory
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Environment Configuration

### Server (.env)
```env
CLIENT_URL=http://localhost:3000    # Frontend URL for CORS
PORT=5000                          # Server port
```

### Client (.env)
```env
REACT_APP_SERVER_URL=http://localhost:5000    # Backend server URL
```

### Production Environment
For production deployment, update the URLs accordingly:
- **Server**: Set `CLIENT_URL` to your deployed frontend domain
- **Client**: Set `REACT_APP_SERVER_URL` to your deployed backend domain

## Usage Guide

### Getting Started

1. **Access the Application**: Open your browser and navigate to the application URL
2. **Select Role**: Choose either "Teacher" or "Student" on the welcome screen
3. **Enter Name**: Students must provide their name; teachers proceed directly

### Teacher Workflow

1. **Create Poll**:
   - Enter your question (max 100 characters)
   - Add 2-6 answer options
   - Set time limit (30 seconds to 2 minutes)
   - Click "Ask Question"

2. **Monitor Responses**:
   - Watch real-time response counts
   - View connected students list
   - Access chat for classroom discussion

3. **View Results**:
   - Click "View Results" to see current standings
   - Results show vote counts and percentages
   - Create new polls after reviewing results

### Student Workflow

1. **Join Session**: Enter your name and wait for questions
2. **Answer Polls**: Select your choice and submit before time expires
3. **View Results**: See poll results immediately after submission
4. **Participate in Chat**: Use the chat feature to discuss with classmates

## API Endpoints

### HTTP Endpoints
- `GET /` - Health check and API status
- `GET /*` - Serves React app (production)

### Socket.IO Events

#### Student Events
- `student-join` - Join session with student name
- `submit-answer` - Submit poll answer

#### Teacher Events  
- `create-poll` - Create new poll with question and options
- `get-results` - Request current poll results
- `kick-student` - Remove student from session

#### Chat Events
- `send-message` - Send chat message
- `get-chat-history` - Request message history
- `clear-chat` - Clear all messages (teacher only)

#### System Events
- `new-question` - Broadcast new poll to all users
- `show-results` - Send poll results
- `poll-ended` - Notify when poll time expires
- `students-update` - Update connected students list

## Deployment

### Using Render (Recommended)

1. **Backend Deployment**:
   - Connect your GitHub repository to Render
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variable: `CLIENT_URL=http://localhost:3000`

2. **Frontend Deployment**:
   - Deploy to Vercel, or similar platform
   - Set environment variable: `REACT_APP_SERVER_URL=http://localhost:5000/`
   - Ensure build folder is properly configured

### Using Docker

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Commit changes**: `git commit -m 'Add new feature'`
4. **Push to branch**: `git push origin feature/new-feature`
5. **Submit pull request**

### Development Guidelines
- Follow existing code style and structure
- Test all socket events thoroughly
- Ensure responsive design compatibility
- Add appropriate error handling
- Update documentation for new features

## Troubleshooting

### Common Issues

**Connection Problems**:
- Verify environment variables are correctly set
- Check CORS configuration matches frontend URL
- Ensure both client and server are running

**Chat Not Working**:
- Confirm socket connection is established
- Check browser console for JavaScript errors
- Verify message event listeners are properly attached

**Poll Results Not Updating**:
- Check Redux store state updates
- Verify socket event handlers are registered
- Ensure poll data is properly synchronized

### Debug Mode
Add console logging to track socket events:
```javascript
socketService.socket.on('connect', () => {
  console.log('Connected to server');
});
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ for interactive learning environments**
