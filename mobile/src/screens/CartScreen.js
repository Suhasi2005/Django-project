import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { colors, radius, spacing } from '../theme';

export default function CartScreen({ navigation }) {
  const { cart, updateItem, removeItem } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>Your cart is empty.</Text>
        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Products')}>
          <Text style={styles.linkButtonText}>Browse products</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.total}>₹{item.total_price}</Text>
            </View>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={String(item.quantity)}
              onChangeText={(value) => updateItem(item.id, Math.max(1, Number(value) || 1))}
            />
            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
      <View style={styles.summary}>
        <Text style={styles.subtotal}>Subtotal: ₹{cart.subtotal}</Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  status: { textAlign: 'center', color: colors.muted, marginTop: spacing.lg },
  linkButton: { alignSelf: 'center', marginTop: spacing.sm },
  linkButtonText: { color: colors.primary, fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius, borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  name: { fontWeight: '600' },
  total: { color: colors.muted },
  qtyInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius, width: 50, padding: spacing.xs, textAlign: 'center' },
  remove: { color: colors.danger },
  summary: {
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  subtotal: { fontSize: 16, fontWeight: '700' },
  button: { backgroundColor: colors.primary, borderRadius: radius, paddingVertical: spacing.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
