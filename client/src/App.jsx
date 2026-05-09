import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import Support     from './pages/Support';
import Settings    from './pages/Settings';
import Systems     from './pages/Systems';
import Council     from './pages/Council';
import Archives    from './pages/Archives';
import DebateRoom  from './pages/DebateRoom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/support"         element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/analytics"       element={<ProtectedRoute><Systems /></ProtectedRoute>} />
          <Route path="/leaderboard"     element={<ProtectedRoute><Council /></ProtectedRoute>} />
          <Route path="/debates/history" element={<ProtectedRoute><Archives /></ProtectedRoute>} />
          <Route path="/debate-room"     element={<ProtectedRoute><DebateRoom /></ProtectedRoute>} />
          <Route path="/"                element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;