import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h2>DukanDar</h2>
      <div>
        <Link to="/">Marketplace</Link>
        {token && role === 'admin' && <Link to="/admin">Admin Control</Link>}
        {token && role === 'seller' && <Link to="/seller">Seller Dashboard</Link>}
        {token ? (
          <button onClick={logout} className="btn" style={{ background: '#dc3545' }}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}