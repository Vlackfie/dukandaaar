import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      navigate('/');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <form className="card" onSubmit={handleSubmit}>
        <h3>Login to DukanDar</h3>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <button type="submit" className="btn">Sign In</button>
      </form>
    </div>
  );
}