import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { createRoom, fetchMyRooms, joinRoom, type Room } from '../../lib/rooms';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id;

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

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

  // Reload the room list every time this screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      fetchMyRooms()
        .then(setRooms)
        .catch((e: Error) => Alert.alert('Could not load rooms', e.message));
    }, [])
  );

  function openRoom(roomId: string) {
    router.push({ pathname: '/room/[id]', params: { id: roomId } });
  }

  async function handleCreate() {
    setBusy(true);
    try {
      const room = await createRoom();
      openRoom(room.id);
    } catch (e) {
      Alert.alert('Could not create room', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      Alert.alert('Invalid code', 'Room codes have 6 characters.');
      return;
    }
    setBusy(true);
    try {
      const room = await joinRoom(trimmed);
      setCode('');
      openRoom(room.id);
    } catch (e) {
      Alert.alert('Could not join room', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, paddingTop: 72, gap: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Hello, {displayName ?? '...'}</Text>

      <Button title="Create a room" onPress={handleCreate} disabled={busy} />

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
          placeholder="Room code"
          placeholderTextColor="#5a5a5a"
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            color: '#000',
          }}
        />
        <Button title="Join" onPress={handleJoin} disabled={busy} />
      </View>

      <Text style={{ fontWeight: '600', marginTop: 8 }}>Your rooms</Text>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={<Text>No rooms yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openRoom(item.id)}
            style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
          >
            <Text style={{ fontSize: 18 }}>
              {item.code}
              {item.owner_id === userId ? '  (owner)' : ''}
            </Text>
          </Pressable>
        )}
      />

      <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}