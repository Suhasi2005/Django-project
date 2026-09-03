import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/categories/').then((data) => setCategories(data.results ?? data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : '';
    api
      .get(`/api/products/${query}`)
      .then((data) => setProducts(data.results ?? data))
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  function selectCategory(slug) {
    if (slug) setSearchParams({ category: slug });
    else setSearchParams({});
  }

  return (
    <div className="page">
      <h1>Shop</h1>

      <div className="category-filters">
        <button
          type="button"
          className={activeCategory === '' ? 'chip chip-active' : 'chip'}
          onClick={() => selectCategory('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            className={activeCategory === cat.slug ? 'chip chip-active' : 'chip'}
            onClick={() => selectCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="status">Loading products…</p>}
      {error && <p className="status status-error">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="status">No products found.</p>}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
