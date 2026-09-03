import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../api';

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/orders/${orderNumber}/`).then(setOrder).catch(() => setError('Order not found.'));
  }, [orderNumber]);

  if (error) return <p className="status status-error">{error}</p>;
  if (!order) return <p className="status">Loading…</p>;

  return (
    <div className="page">
      {location.state?.justPlaced && (
        <p className="status status-success">Order placed successfully!</p>
      )}
      <h1>Order #{order.order_number}</h1>
      <p>Status: <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></p>
      <p>Placed on {new Date(order.created_at).toLocaleString()}</p>

      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.price}</td>
              <td>₹{item.total_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <p>Subtotal: ₹{order.subtotal}</p>
        <p>Tax: ₹{order.tax}</p>
        <p>Shipping: ₹{order.shipping_cost}</p>
        <p><strong>Total: ₹{order.total}</strong></p>
      </div>

      <div className="order-address">
        <h3>Shipping Address</h3>
        <p>{order.shipping_address}</p>
        <p>Phone: {order.contact_phone}</p>
        <p>Payment: {order.payment_method}</p>
      </div>
    </div>
  );
}
