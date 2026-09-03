import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <p className="status">Your cart is empty. <Link to="/">Browse products</Link>.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product.name}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, Math.max(1, Number(e.target.value)))}
                />
              </td>
              <td>₹{item.total_price}</td>
              <td>
                <button type="button" className="link-button" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <p>Subtotal: <strong>₹{cart.subtotal}</strong></p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
