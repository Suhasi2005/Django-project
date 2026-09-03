import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { colors, radius, spacing } from '../theme';

const PAYMENT_METHODS = [
  ['COD', 'Cash on Delivery'],
  ['CARD', 'Credit/Debit Card'],
  ['UPI', 'UPI Payment'],
  ['NETBANKING', 'Net Banking'],
];

export default function CheckoutScreen({ navigation }) {
  const { cart, setCart } = useCart();

  const [form, setForm] = useState({
    payment_method: 'COD',
    shipping_address: '',
    billing_address: '',
    contact_phone: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.post('/api/checkout/', form);
      setCart(null);
      navigation.replace('OrderDetail', { orderNumber: order.order_number, justPlaced: true });
    } catch (err) {
      setError(err.data?.detail || 'Checkout failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return <Text style={styles.status}>Your cart is empty.</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_METHODS.map(([value, label]) => (
          <Pressable
            key={value}
            style={[styles.chip, form.payment_method === value && styles.chipActive]}
            onPress={() => updateField('payment_method', value)}
          >
            <Text style={[styles.chipText, form.payment_method === value && styles.chipTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Shipping Address</Text>
      <TextInput
        style={styles.input}
        multiline
        value={form.shipping_address}
        onChangeText={(v) => updateField('shipping_address', v)}
      />

      <Text style={styles.label}>Contact Phone</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={form.contact_phone}
        onChangeText={(v) => updateField('contact_phone', v)}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={styles.input}
        value={form.notes}
        onChangeText={(v) => updateField('notes', v)}
      />

      <Text style={styles.subtotal}>Subtotal: ₹{cart.subtotal}</Text>

      {error && <Text style={styles.statusError}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Placing order…' : 'Place Order'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    padding: spacing.sm, backgroundColor: colors.surface,
  },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: '#fff' },
  subtotal: { fontSize: 16, fontWeight: '700', marginVertical: spacing.md },
  button: { backgroundColor: colors.primary, borderRadius: radius, paddingVertical: spacing.sm, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  status: { padding: spacing.md, color: colors.muted },
  statusError: { color: colors.danger, marginBottom: spacing.sm },
});
