import React, { useState, useEffect } from 'react';

export default function DashboardAdmin() {
  const [metrics, setMetrics] = useState({ revenue: 0, pendingSellers: [] });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    const res = await fetch('http://localhost:5000/api/admin/metrics', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (res.ok) setMetrics(data);
  };

  const approveSeller = async (id) => {
    await fetch('http://localhost:5000/api/admin/verify-seller', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ seller_id: id })
    });
    loadMetrics();
  };

  return (
    <div className="container">
      <h2>Master Dashboard System (Admin Space)</h2>
      <div className="card" style={{ background: '#e2f0d9' }}>
        <h3>Total Cumulative System Revenue</h3>
        <p style={{ fontSize: '2rem', margin: 0 }}>${metrics.revenue}</p>
      </div>

      <div className="card">
        <h3>Pending Storefront Verification Enforcements</h3>
        {metrics.pendingSellers.length === 0 ? <p>No vendors pending evaluation.</p> : (
          <ul>
            {metrics.pendingSellers.map(s => (
              <li key={s.id} style={{ marginBottom: '10px' }}>
                {s.name} ({s.email}) <button onClick={() => approveSeller(s.id)} className="btn btn-success" style={{ padding: '2px 10px', marginLeft: '1rem' }}>Verify</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}