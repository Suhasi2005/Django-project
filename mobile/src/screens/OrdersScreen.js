import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import { colors, radius, spacing } from '../theme';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/').then((data) => setOrders(data.results ?? data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.status} />;

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>You haven't placed any orders yet.</Text>
        <Pressable onPress={() => navigation.navigate('Products')}>
          <Text style={styles.link}>Start shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md }}
      data={orders}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('OrderDetail', { orderNumber: item.order_number })}
        >
          <Text style={styles.orderNumber}>#{item.order_number}</Text>
          <Text style={styles.badge}>{item.status}</Text>
          <Text style={styles.total}>₹{item.total}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  status: { textAlign: 'center', color: colors.muted, marginTop: spacing.lg },
  link: { textAlign: 'center', color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  orderNumber: { fontWeight: '600' },
  badge: { color: colors.primaryDark, fontWeight: '600' },
  total: { fontWeight: '700' },
});
