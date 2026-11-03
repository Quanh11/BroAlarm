import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  color: '#000',
} as const;

export default function SignIn() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    if (mode === 'sign-up' && !displayName.trim()) {
      Alert.alert('Missing info', 'Please enter a display name.');
      return;
    }

    setLoading(true);
    if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) Alert.alert('Sign in failed', error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) {
        Alert.alert('Sign up failed', error.message);
      } else if (!data.session) {
        Alert.alert('Check your email', 'Confirm your email address, then sign in.');
      }
    }
    setLoading(false);
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', textAlign: 'center' }}>Bro Alarm</Text>
      <Text style={{ textAlign: 'center', marginBottom: 12 }}>
        {mode === 'sign-in' ? 'Sign in to your account' : 'Create a new account'}
      </Text>

      {mode === 'sign-up' && (
        <TextInput
          placeholder="Display name"
          placeholderTextColor="#5a5a5a"
          value={displayName}
          onChangeText={setDisplayName}
          style={inputStyle}
        />
      )}
      <TextInput
        placeholder="Username or email"
        placeholderTextColor="#5a5a5a"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={inputStyle}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#5a5a5a"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        style={inputStyle}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title={mode === 'sign-in' ? 'Sign in' : 'Sign up'} onPress={handleSubmit} />
      )}
      <Button
        title={mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
      />
    </View>
  );
}