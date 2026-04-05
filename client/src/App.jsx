import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login     from './pages/Login';
import Signup    from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Support   from './pages/Support';
import Settings  from './pages/Settings';
import Systems   from './pages/Systems';
import Council   from './pages/Council';
import Archives  from './pages/Archives';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/support"         element={<Support />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/analytics"       element={<Systems />} />
          <Route path="/leaderboard"     element={<Council />} />
          <Route path="/debates/history" element={<Archives />} />
          <Route path="/"                element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;