import React, { useState, useEffect } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchFeed();
  }, [category]);

  const fetchFeed = async () => {
    let url = `http://localhost:5000/api/products?category=${category}`;
    if (search) url += `&search=${search}`;
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data);
  };

  const executeCheckout = async (prodId, price) => {
    const method = prompt("Choose payment method: 'Mobile Banking', 'Card Payment', or 'Cash on Delivery'");
    if (!method) return;

    const res = await fetch('http://localhost:5000/api/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        items: [{ product_id: prodId, quantity: 1 }],
        payment_method: method,
        total_amount: price
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Order processed via transaction engine! Order ID: ${data.orderId}`);
      fetchFeed();
    } else {
      alert(`Transaction Rolled Back: ${data.error}`);
    }
  };

  return (
    <div className="container">
      <h2>Global Feed Marketplace</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Search parameters..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem', flex: 1 }} />
        <button onClick={fetchFeed} className="btn">Apply Filter</button>
      </div>

      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p><strong>Price:</strong> ${p.price} | <strong>Stock:</strong> {p.stock}</p>
            <p><small>Rating: {Number(p.avg_rating).toFixed(1)} ★ | Total Sold: {p.units_sold}</small></p>
            <button onClick={() => executeCheckout(p.id, p.price)} className="btn btn-success" disabled={p.stock <= 0}>
              {p.stock > 0 ? 'Buy 1-Click' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}