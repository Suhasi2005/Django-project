import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError(null);
    (async () => {
      try {
        const data = await api.get(`/api/products/${slug}/`);
        setProduct(data);
      } catch {
        setError('Product not found.');
      }
    })();
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
      return;
    }
    setAdding(true);
    setError(null);
    setAdded(false);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
    } catch (err) {
      setError(err.data?.detail || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  if (error && !product) return <p className="status status-error">{error}</p>;
  if (!product) return <p className="status">Loading…</p>;

  return (
    <div className="page product-detail">
      <div className="product-detail-image">
        {product.image ? <img src={product.image} alt={product.name} /> : <div className="image-placeholder" />}
      </div>
      <div className="product-detail-body">
        <p className="product-card-category">{product.category?.name}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">₹{product.price}</p>
        <p>{product.description}</p>
        <p className="stock-note">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>

        {product.stock > 0 && (
          <div className="add-to-cart-row">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
            <button type="button" className="btn btn-primary" onClick={handleAddToCart} disabled={adding}>
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        )}

        {added && <p className="status status-success">Added to cart.</p>}
        {error && <p className="status status-error">{error}</p>}
      </div>
    </div>
  );
}
