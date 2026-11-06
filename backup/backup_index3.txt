import { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) Alert.alert('Could not load profile', error.message);
        else setDisplayName(data.display_name);
      });
  }, [userId]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        backgroundColor: '#fff',
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Hello, {displayName ?? '...'}</Text>
      <Text>{session?.user.email}</Text>
      <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}