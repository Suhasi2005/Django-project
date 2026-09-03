import { useEffect, useState } from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, radius, spacing } from '../theme';

export default function ProductDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError(null);
    api.get(`/api/products/${slug}/`, { auth: false })
      .then(setProduct)
      .catch(() => setError('Product not found.'));
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    setAdding(true);
    setError(null);
    setAdded(false);
    try {
      await addItem(product.id, Math.max(1, Number(quantity) || 1));
      setAdded(true);
    } catch (err) {
      setError(err.data?.detail || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  if (error && !product) return <Text style={styles.statusError}>{error}</Text>;
  if (!product) return <Text style={styles.status}>Loading…</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <Text style={styles.category}>{product.category?.name}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.stock}>
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </Text>

      {product.stock > 0 && (
        <View style={styles.row}>
          <TextInput
            style={styles.qtyInput}
            keyboardType="number-pad"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Pressable style={styles.button} onPress={handleAddToCart} disabled={adding}>
            <Text style={styles.buttonText}>{adding ? 'Adding…' : 'Add to Cart'}</Text>
          </Pressable>
        </View>
      )}

      {added && <Text style={styles.statusSuccess}>Added to cart.</Text>}
      {error && <Text style={styles.statusError}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  image: { width: '100%', aspectRatio: 1, borderRadius: radius, marginBottom: spacing.md },
  imagePlaceholder: { backgroundColor: '#eee' },
  category: { color: colors.muted, fontSize: 12 },
  name: { fontSize: 22, fontWeight: '700', marginVertical: spacing.xs },
  price: { fontSize: 20, fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.sm },
  description: { color: colors.text, marginBottom: spacing.sm },
  stock: { color: colors.muted, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  qtyInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    width: 60, padding: spacing.sm, textAlign: 'center',
  },
  button: { backgroundColor: colors.primary, borderRadius: radius, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  buttonText: { color: '#fff', fontWeight: '600' },
  status: { padding: spacing.md, color: colors.muted },
  statusError: { padding: spacing.md, color: colors.danger },
  statusSuccess: { marginTop: spacing.sm, color: colors.primaryDark, fontWeight: '600' },
});
