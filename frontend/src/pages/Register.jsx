import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      alert('Registration successful! Access granted to login workspace.');
      navigate('/login');
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <form className="card" onSubmit={handleSubmit}>
        <h3>Create Account</h3>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" required onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Account Role</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="customer">Buyer (Customer)</option>
            <option value="seller">Seller (Dukandar)</option>
          </select>
        </div>
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
}