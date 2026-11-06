import { supabase } from './supabase';

export type Room = {
  id: string;
  code: string;
  owner_id: string;
  created_at: string;
};

export type Member = {
  userId: string;
  displayName: string;
};

const ROOM_COLUMNS = 'id, code, owner_id, created_at';

export async function createRoom(): Promise<Room> {
  const { data, error } = await supabase.rpc('create_room');
  if (error) throw new Error(error.message);
  return data as Room;
}

export async function joinRoom(code: string): Promise<Room> {
  const { data, error } = await supabase.rpc('join_room', { _code: code });
  if (error) throw new Error(error.message);
  return data as Room;
}

export async function leaveRoom(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_room', { _room_id: roomId });
  if (error) throw new Error(error.message);
}

export async function fetchMyRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select(ROOM_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Room[];
}

export async function fetchRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select(ROOM_COLUMNS)
    .eq('id', roomId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Room | null) ?? null;
}

export async function fetchMembers(roomId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('room_members')
    .select('user_id, profiles(display_name)')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    userId: row.user_id,
    displayName: row.profiles?.display_name ?? 'Unknown',
  }));
}