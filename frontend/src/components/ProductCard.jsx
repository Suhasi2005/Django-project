import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.image ? <img src={product.image} alt={product.name} /> : <div className="image-placeholder" />}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-card-category">{product.category?.name}</p>
        <p className="product-card-price">₹{product.price}</p>
      </div>
    </Link>
  );
}
