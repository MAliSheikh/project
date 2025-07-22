# AI Academic Report Companion Frontend

A modern React-based frontend application that provides an AI-powered chat interface for academic support and guidance.

## 🚀 Features

- **User Authentication**: Secure login system with JWT token management
- **AI Chat Interface**: Beautiful, responsive chat popup with real-time messaging
- **Chat History Management**: Persistent chat history during user sessions
- **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)
- **API Fallback**: Graceful handling of API downtime with dummy chat functionality
- **Clean Architecture**: Well-organized codebase with separation of concerns

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Axios** for API requests
- **jwt-decode** for JWT token handling
- **Lucide React** for icons
- **Context API** for state management
- **Vite** for build tooling

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-academic-report-companion-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API base URL:
```env
VITE_API_BASE_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

## 📱 Application Flow

### Authentication Flow
1. **Login Page**: Users see a login form with demo credentials pre-filled
2. **Token Management**: JWT tokens are stored in sessionStorage for security
3. **Auto-logout**: Tokens are validated and expired tokens trigger automatic logout
4. **Registration**: Accessible only via direct URL (not implemented in this version)

### Chat System Flow
1. **Landing Page**: Welcome screen with chat icon in bottom-right corner
2. **Chat History**: Automatically fetched once upon login
3. **Real-time Chat**: Send messages and receive AI responses
4. **Session Persistence**: Chat history maintained in memory during session
5. **Reset Functionality**: Clear chat history with reset button

### Demo Credentials
- **Email**: `muhammad.hassan.parent@gmail.com`
- **Password**: `parent124`

## 🔌 API Integration

### Login API
```bash
POST http://localhost:8000/login
Content-Type: application/x-www-form-urlencoded

grant_type=password
username=muhammad.hassan.parent@gmail.com
password=parent124
scope=
client_id=string
client_secret=********
```

### Chat Message API
```bash
GET http://localhost:8000/rag_query/?question=mid%20term
Authorization: Bearer <jwt_token>
```

### Chat History API
```bash
GET http://localhost:8000/chat_history/
Authorization: Bearer <jwt_token>
```

## 🎯 API Request Optimization

### Strategy
- **Single History Fetch**: Chat history is fetched only once per login session
- **Request Deduplication**: Prevents multiple simultaneous requests to the same endpoint
- **Error Handling**: Graceful fallback to dummy data when APIs are unavailable
- **Token Management**: Automatic token validation and refresh handling
- **Memory Management**: Chat state is cleared on logout to prevent memory leaks

### Performance Features
- **Lazy Loading**: Components are loaded only when needed
- **Memoization**: Context values are memoized to prevent unnecessary re-renders
- **Optimistic Updates**: User messages appear instantly while API calls are processed
- **Session Storage**: Tokens persist across browser refreshes but clear on close

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (600, 700)
- **Secondary**: Purple (600)
- **Success**: Green (600)
- **Error**: Red (600)
- **Neutral**: Gray scale

### Typography
- **Headings**: Bold weights with proper hierarchy
- **Body Text**: Regular weight with good line height
- **Interactive Elements**: Medium weight for emphasis

### Layout
- **Mobile First**: Responsive design starting from mobile
- **Grid System**: CSS Grid and Flexbox for layouts
- **Spacing**: Consistent 8px spacing system
- **Shadows**: Subtle depth with layered shadows

## 📂 Project Structure

```
src/
├── components/
│   ├── Login.tsx          # Authentication component
│   ├── Landing.tsx        # Main dashboard page
│   └── ChatPopup.tsx      # Chat interface component
├── contexts/
│   ├── AuthContext.tsx    # Authentication state management
│   └── ChatContext.tsx    # Chat state management
├── services/
│   └── api.ts            # API service layer
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## 🔐 Security Features

- **JWT Token Handling**: Secure storage and automatic expiration handling
- **XSS Protection**: Input sanitization and secure rendering
- **CORS Handling**: Proper cross-origin request configuration
- **Session Management**: Automatic cleanup on logout

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Error Handling

### API Error Scenarios
- **Network Errors**: Graceful fallback to dummy data
- **Authentication Errors**: Automatic logout and redirect to login
- **Server Errors**: User-friendly error messages
- **Timeout Errors**: Retry mechanism with exponential backoff

### User Experience
- **Loading States**: Clear indicators during API calls
- **Error Messages**: Helpful feedback for user actions
- **Offline Support**: Basic functionality when APIs are down
- **Progressive Enhancement**: Core features work without JavaScript

## 🔄 State Management

### Context API Usage
- **AuthContext**: Handles user authentication, token management, and login state
- **ChatContext**: Manages chat messages, history, and real-time communication
- **Separation of Concerns**: Each context handles specific domain logic

### Memory Management
- **Session-based Storage**: Chat history cleared on logout
- **No LocalStorage**: Sensitive data not persisted beyond session
- **Garbage Collection**: Proper cleanup of event listeners and subscriptions

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- **Touch-friendly Interface**: Larger tap targets
- **Optimized Chat UI**: Full-screen chat on mobile
- **Keyboard Handling**: Proper input focus management
- **Performance**: Optimized for slower networks

## 🔮 Future Enhancements

- [ ] Registration API integration
- [ ] Push notifications for new messages
- [ ] File upload support in chat
- [ ] Voice message recording
- [ ] Dark mode theme
- [ ] Offline message queuing
- [ ] Advanced chat features (typing indicators, read receipts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.