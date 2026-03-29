import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Systems from './pages/Systems';
import Council from './pages/Council';
import Archives from './pages/Archives';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login"            element={<Login />} />
        <Route path="/signup"           element={<Signup />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/support"          element={<Support />} />
        <Route path="/settings"         element={<Settings />} />
        <Route path="/analytics"        element={<Systems />} />
        <Route path="/leaderboard"      element={<Council />} />
        <Route path="/"                 element={<Navigate to="/login" replace />} />
        <Route path="/debates/history"  element={<Archives />} />
      </Routes>
    </Router>
  );
}

export default App;