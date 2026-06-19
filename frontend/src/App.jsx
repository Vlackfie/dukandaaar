import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardSeller from './pages/DashboardSeller';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}><DashboardAdmin /></ProtectedRoute>
        } />
        
        <Route path="/seller" element={
          <ProtectedRoute allowedRoles={['seller']}><DashboardSeller /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}