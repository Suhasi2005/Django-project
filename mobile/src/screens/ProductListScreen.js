import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, radius, spacing } from '../theme';

export default function ProductListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.headerLink}>
              Cart{cart && cart.total_items > 0 ? ` (${cart.total_items})` : ''}
            </Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate(user ? 'Orders' : 'Login')}>
            <Text style={styles.headerLink}>{user ? 'Orders' : 'Login'}</Text>
          </Pressable>
          {user && (
            <Pressable onPress={logout}>
              <Text style={styles.headerLink}>Logout</Text>
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, user, cart, logout]);

  useEffect(() => {
    api.get('/api/categories/', { auth: false })
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : '';
    api.get(`/api/products/${query}`, { auth: false })
      .then((data) => setProducts(data.results ?? data))
      .catch(() => setError('Could not load products. Is the backend running and reachable?'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        data={[{ slug: null, name: 'All' }, ...categories]}
        keyExtractor={(item) => item.slug ?? 'all'}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, activeCategory === item.slug && styles.chipActive]}
            onPress={() => setActiveCategory(item.slug)}
          >
            <Text style={[styles.chipText, activeCategory === item.slug && styles.chipTextActive]}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      {loading && <ActivityIndicator style={styles.status} />}
      {error && <Text style={[styles.status, styles.statusError]}>{error}</Text>}
      {!loading && !error && products.length === 0 && (
        <Text style={styles.status}>No products found.</Text>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.imagePlaceholder]} />
            )}
            <Text style={styles.cardCategory}>{item.category?.name}</Text>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardPrice}>₹{item.price}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerButtons: { flexDirection: 'row', gap: spacing.md, marginRight: spacing.sm },
  headerLink: { color: colors.primary, fontWeight: '600' },
  chipRow: { flexGrow: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chip: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 999,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: '#fff' },
  status: { textAlign: 'center', color: colors.muted, marginTop: spacing.lg },
  statusError: { color: colors.danger },
  grid: { padding: spacing.md },
  row: { justifyContent: 'space-between' },
  card: {
    backgroundColor: colors.surface, borderRadius: radius, borderWidth: 1, borderColor: colors.border,
    width: '48%', marginBottom: spacing.md, overflow: 'hidden', padding: spacing.sm,
  },
  cardImage: { width: '100%', aspectRatio: 1, borderRadius: radius - 4, marginBottom: spacing.xs },
  imagePlaceholder: { backgroundColor: '#eee' },
  cardCategory: { color: colors.muted, fontSize: 12 },
  cardName: { fontWeight: '600', marginVertical: 2 },
  cardPrice: { fontWeight: '700' },
});
