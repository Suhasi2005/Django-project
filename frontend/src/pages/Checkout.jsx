import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';

const PAYMENT_METHODS = [
  ['COD', 'Cash on Delivery'],
  ['CARD', 'Credit/Debit Card'],
  ['UPI', 'UPI Payment'],
  ['NETBANKING', 'Net Banking'],
];

export default function Checkout() {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    payment_method: 'COD',
    shipping_address: '',
    billing_address: '',
    contact_phone: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.post('/api/checkout/', form);
      setCart(null);
      navigate(`/orders/${order.order_number}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.data?.detail || 'Checkout failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Payment Method
          <select value={form.payment_method} onChange={updateField('payment_method')}>
            {PAYMENT_METHODS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          Shipping Address
          <textarea required value={form.shipping_address} onChange={updateField('shipping_address')} />
        </label>

        <label>
          Billing Address (optional, defaults to shipping)
          <textarea value={form.billing_address} onChange={updateField('billing_address')} />
        </label>

        <label>
          Contact Phone
          <input required type="tel" value={form.contact_phone} onChange={updateField('contact_phone')} />
        </label>

        <label>
          Notes (optional)
          <textarea value={form.notes} onChange={updateField('notes')} />
        </label>

        <div className="cart-summary">
          <p>Subtotal: ₹{cart.subtotal}</p>
        </div>

        {error && <p className="status status-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
