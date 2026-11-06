import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, Text, View } from 'react-native';
import { fetchMembers, fetchRoom, leaveRoom, type Member, type Room } from '../../../lib/rooms';
import { useSession } from '../../../lib/session';
import { supabase } from '../../../lib/supabase';

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const closed = useRef(false);

  const load = useCallback(async () => {
    if (closed.current) return;
    try {
      const r = await fetchRoom(id);
      if (!r) {
        closed.current = true;
        Alert.alert('Room closed', 'This room no longer exists.');
        router.replace('/');
        return;
      }
      setRoom(r);
      setMembers(await fetchMembers(id));
    } catch (e) {
      Alert.alert('Could not load room', (e as Error).message);
    }
  }, [id, router]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`room-members-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members' },
        (payload) => {
          const newRow = payload.new as { room_id?: string };
          const oldRow = payload.old as { room_id?: string };
          if ((newRow?.room_id ?? oldRow?.room_id) === id) load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, load]);

  const isOwner = room?.owner_id === userId;

  async function handleLeave() {
    try {
      closed.current = true;
      await leaveRoom(id);
      router.replace('/');
    } catch (e) {
      closed.current = false;
      Alert.alert('Could not leave room', (e as Error).message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 16, backgroundColor: '#fff' }}>
      <Text>Share this code with your friends</Text>
      <Text style={{ fontSize: 40, fontWeight: '700', letterSpacing: 6 }}>
        {room?.code ?? '......'}
      </Text>

      <Text style={{ fontWeight: '600', marginTop: 8 }}>Members ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(m) => m.userId}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 18, paddingVertical: 6 }}>
            {item.displayName}
            {item.userId === userId ? ' (you)' : ''}
            {item.userId === room?.owner_id ? ' · owner' : ''}
          </Text>
        )}
      />

      <Button title={isOwner ? 'Close room' : 'Leave room'} color="#d00" onPress={handleLeave} />
    </View>
  );
}