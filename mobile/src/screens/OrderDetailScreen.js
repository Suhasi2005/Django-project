import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import { colors, radius, spacing } from '../theme';

export default function OrderDetailScreen({ route }) {
  const { orderNumber, justPlaced } = route.params;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/orders/${orderNumber}/`).then(setOrder).catch(() => setError('Order not found.'));
  }, [orderNumber]);

  if (error) return <Text style={styles.statusError}>{error}</Text>;
  if (!order) return <Text style={styles.status}>Loading…</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      {justPlaced && <Text style={styles.statusSuccess}>Order placed successfully!</Text>}
      <Text style={styles.title}>Order #{order.order_number}</Text>
      <Text style={styles.badge}>{order.status}</Text>

      <FlatList
        data={order.items}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }}>{item.name} × {item.quantity}</Text>
            <Text style={styles.total}>₹{item.total_price}</Text>
          </View>
        )}
      />

      <View style={styles.summary}>
        <Text>Subtotal: ₹{order.subtotal}</Text>
        <Text>Tax: ₹{order.tax}</Text>
        <Text>Shipping: ₹{order.shipping_cost}</Text>
        <Text style={styles.grandTotal}>Total: ₹{order.total}</Text>
      </View>

      <Text style={styles.sectionTitle}>Shipping Address</Text>
      <Text>{order.shipping_address}</Text>
      <Text>Phone: {order.contact_phone}</Text>
      <Text>Payment: {order.payment_method}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  status: { padding: spacing.md, color: colors.muted },
  statusError: { padding: spacing.md, color: colors.danger },
  statusSuccess: { color: colors.primaryDark, fontWeight: '700', marginBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '700' },
  badge: { color: colors.primaryDark, fontWeight: '600', marginBottom: spacing.md },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  total: { fontWeight: '600' },
  summary: { marginTop: spacing.md, gap: 4 },
  grandTotal: { fontWeight: '700', fontSize: 16, marginTop: spacing.xs },
  sectionTitle: { fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.xs },
});
