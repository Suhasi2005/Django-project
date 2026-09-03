import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import LoginScreen from './src/screens/LoginScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user } = useAuth();
  const { cart } = useCart();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Products"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="Products" component={ProductListScreen} options={{ title: 'OneStop Disposables' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: `Cart${cart && cart.total_items > 0 ? ` (${cart.total_items})` : ''}` }}
        />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Your Orders' }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
        {!user && <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />}
        {!user && <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="auto" />
        <Navigation />
      </CartProvider>
    </AuthProvider>
  );
}
