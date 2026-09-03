import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', phone: '', password1: '', password2: '' });
  const [errors, setErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrors(null);
    try {
      await register(form);
      navigation.navigate('Products');
    } catch (err) {
      setErrors(err.data || { __all__: ['Registration failed.'] });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (field) => errors?.[field]?.join(' ');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.title}>Register</Text>

      <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={form.username} onChangeText={(v) => updateField('username', v)} />
      {fieldError('username') && <Text style={styles.error}>{fieldError('username')}</Text>}

      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(v) => updateField('email', v)} />
      {fieldError('email') && <Text style={styles.error}>{fieldError('email')}</Text>}

      <TextInput style={styles.input} placeholder="Phone (optional)" value={form.phone} onChangeText={(v) => updateField('phone', v)} />

      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password1} onChangeText={(v) => updateField('password1', v)} />
      {fieldError('password1') && <Text style={styles.error}>{fieldError('password1')}</Text>}

      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={form.password2} onChangeText={(v) => updateField('password2', v)} />
      {fieldError('password2') && <Text style={styles.error}>{fieldError('password2')}</Text>}

      {errors?.__all__ && <Text style={styles.error}>{errors.__all__.join(' ')}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Creating account…' : 'Register'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.lg },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    padding: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.xs,
  },
  error: { color: colors.danger, marginBottom: spacing.sm },
  button: { backgroundColor: colors.primary, borderRadius: radius, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
