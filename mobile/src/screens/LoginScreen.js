import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      navigation.navigate('Products');
    } catch (err) {
      setError(err.data?.__all__?.[0] || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Logging in…' : 'Login'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>No account? Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.lg },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    padding: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  error: { color: colors.danger, marginBottom: spacing.sm },
  button: { backgroundColor: colors.primary, borderRadius: radius, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
