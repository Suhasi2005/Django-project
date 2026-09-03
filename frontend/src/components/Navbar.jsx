import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">OneStop Disposables</Link>
      <nav className="navbar-links">
        <Link to="/">Shop</Link>
        {user && (
          <Link to="/orders">Orders</Link>
        )}
        <Link to="/cart" className="cart-link">
          Cart{cart && cart.total_items > 0 ? ` (${cart.total_items})` : ''}
        </Link>
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.username}</span>
            <button type="button" className="link-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
