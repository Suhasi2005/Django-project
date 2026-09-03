import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/').then((data) => setOrders(data.results ?? data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>Your Orders</h1>
        <p className="status">You haven't placed any orders yet. <Link to="/">Start shopping</Link>.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Orders</h1>
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order.id}>
            <Link to={`/orders/${order.order_number}`} className="order-list-item">
              <span>#{order.order_number}</span>
              <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              <span>₹{order.total}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
