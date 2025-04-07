import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/Mainlayout';

// Pages
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ServiceDetail from './pages/ServiceDetail';
import CreateService from './pages/CreateService';
import NotFound from './pages/NotFound';

// CSS
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="marketplace" element={isAuthenticated ? <Marketplace /> : <Navigate to="/login" />} />
          <Route path="services/create" element={isAuthenticated ? <CreateService /> : <Navigate to="/login" />} />
          <Route path="services/:id" element={isAuthenticated ? <ServiceDetail /> : <Navigate to="/login" />} />
          <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;