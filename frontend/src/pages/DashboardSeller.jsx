import React, { useState, useEffect } from 'react';

export default function DashboardSeller() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: 0, stock: 1, category_id: 1 });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const res = await fetch('http://localhost:5000/api/products/seller-inventory', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (res.ok) setInventory(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    loadInventory();
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <h3>Your Active Storefront Stock Profile</h3>
        {inventory.map(item => (
          <div className="card" key={item.id}>
            <h4>{item.name}</h4>
            <p>Stock Allocation: {item.stock} items available</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ width: '400px' }}>
        <h3>Add New Product Listing</h3>
        <form onSubmit={handleCreate}>
          <div className="form-group"><label>Title</label><input type="text" onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="form-group"><label>Description</label><textarea onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="form-group"><label>Price ($)</label><input type="number" onChange={e => setForm({...form, price: e.target.value})} required /></div>
          <div className="form-group"><label>Initial Stock Allocation</label><input type="number" onChange={e => setForm({...form, stock: e.target.value})} required /></div>
          <button type="submit" className="btn">Publish to Marketplace</button>
        </form>
      </div>
    </div>
  );
}