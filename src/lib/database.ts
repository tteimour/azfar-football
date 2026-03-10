import { supabase } from './supabase';
import { User, Room, Stadium, JoinRequest, RoomParticipant, PlayerStats, PlayerRating, WaitlistEntry } from '@/types';

// ============ Profile Functions ============

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Don't log error if profile simply doesn't exist yet (PGRST116 = no rows)
    if (error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    return null;
  }

  return data as User;
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message, error.details, error.hint);
    return null;
  }

  return data as User;
}

export async function upsertProfile(profile: Partial<User> & { id: string; email: string }): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error.message, error.details, error.hint);
    return null;
  }

  return data as User;
}

export async function createProfile(profile: Partial<User> & { id: string; email: string; full_name: string }): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      age: profile.age,
      preferred_position: profile.preferred_position || 'any',
      skill_level: profile.skill_level || 'intermediate',
      bio: profile.bio,
      games_played: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data as User;
}

export async function getPublicProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, preferred_position, skill_level, avatar_url, games_played, bio, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching public profile:', error);
    }
    return null;
  }

  return data as User;
}

// ============ Stadium Functions ============

export async function getStadiums(): Promise<Stadium[]> {
  const { data, error } = await supabase
    .from('stadiums')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching stadiums:', error);
    return [];
  }

  return data as Stadium[];
}

export async function getStadium(id: string): Promise<Stadium | null> {
  const { data, error } = await supabase
    .from('stadiums')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching stadium:', error);
    return null;
  }

  return data as Stadium;
}

// ============ Room Functions ============

export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      stadium:stadiums(*),
      creator:profiles(*)
    `)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return data.map(room => ({
    ...room,
    stadium_id: room.stadium?.id || room.stadium_id,
  })) as Room[];
}

export async function getRoom(id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      stadium:stadiums(*),
      creator:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching room:', error);
    return null;
  }

  return data as Room;
}

export async function getMyRooms(userId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      stadium:stadiums(*),
      creator:profiles(*)
    `)
    .eq('creator_id', userId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching my rooms:', error);
    return [];
  }

  return data as Room[];
}

export async function createRoom(room: {
  title: string;
  description?: string;
  stadium_id?: string;
  stadium_name: string;
  stadium_address?: string;
  stadium_price_per_hour?: number;
  stadium_latitude?: number;
  stadium_longitude?: number;
  creator_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_players: number;
  skill_level_required: string;
}): Promise<Room | null> {
  // Try with new schema first (includes inline stadium fields)
  let { data, error } = await supabase
    .from('rooms')
    .insert({
      title: room.title,
      description: room.description,
      stadium_id: room.stadium_id || null,
      stadium_name: room.stadium_name,
      stadium_address: room.stadium_address,
      stadium_price_per_hour: room.stadium_price_per_hour,
      stadium_latitude: room.stadium_latitude,
      stadium_longitude: room.stadium_longitude,
      creator_id: room.creator_id,
      date: room.date,
      start_time: room.start_time,
      end_time: room.end_time,
      max_players: room.max_players,
      skill_level_required: room.skill_level_required,
      current_players: 1,
      status: 'open',
    })
    .select(`
      *,
      stadium:stadiums(*),
      creator:profiles(*)
    `)
    .single();

  // If error mentions column doesn't exist, try old schema
  if (error && (error.message?.includes('column') || error.code === '42703')) {
    console.warn('New stadium columns not found, using legacy schema. Run migration 003 to enable custom stadiums.');

    // Fall back to old schema without inline stadium fields
    const fallbackResult = await supabase
      .from('rooms')
      .insert({
        title: room.title,
        description: room.description,
        stadium_id: room.stadium_id || null,
        creator_id: room.creator_id,
        date: room.date,
        start_time: room.start_time,
        end_time: room.end_time,
        max_players: room.max_players,
        skill_level_required: room.skill_level_required,
        current_players: 1,
        status: 'open',
      })
      .select(`
        *,
        stadium:stadiums(*),
        creator:profiles(*)
      `)
      .single();

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    console.error('Error creating room:', error.message, error.details, error.hint);
    return null;
  }

  if (!data) {
    console.error('No data returned from room creation');
    return null;
  }

  // Add creator as first participant
  await addParticipant(data.id, room.creator_id);

  // Return with inline stadium fields for compatibility
  return {
    ...data,
    stadium_name: data.stadium_name || data.stadium?.name || room.stadium_name,
    stadium_address: data.stadium_address || data.stadium?.address,
    stadium_price_per_hour: data.stadium_price_per_hour || data.stadium?.price_per_hour,
    stadium_latitude: data.stadium_latitude || data.stadium?.latitude,
    stadium_longitude: data.stadium_longitude || data.stadium?.longitude,
  } as Room;
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      stadium:stadiums(*),
      creator:profiles(*)
    `)
    .single();

  if (error) {
    console.error('Error updating room:', error);
    return null;
  }

  return data as Room;
}

// ============ Join Request Functions ============

export async function getRequestsForRoom(roomId: string): Promise<JoinRequest[]> {
  const { data, error } = await supabase
    .from('join_requests')
    .select(`
      *,
      user:profiles(*),
      room:rooms(*)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests for room:', error);
    return [];
  }

  return data as JoinRequest[];
}

export async function getRequestsForUser(userId: string): Promise<JoinRequest[]> {
  const { data, error } = await supabase
    .from('join_requests')
    .select(`
      *,
      user:profiles(*),
      room:rooms(*, stadium:stadiums(*))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests for user:', error);
    return [];
  }

  return data as JoinRequest[];
}

export async function getPendingRequestsForMyRooms(userId: string): Promise<JoinRequest[]> {
  // First get my room IDs
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id')
    .eq('creator_id', userId);

  if (roomsError || !rooms) {
    console.error('Error fetching my rooms:', roomsError);
    return [];
  }

  const roomIds = rooms.map(r => r.id);
  if (roomIds.length === 0) return [];

  const { data, error } = await supabase
    .from('join_requests')
    .select(`
      *,
      user:profiles(*),
      room:rooms(*, stadium:stadiums(*))
    `)
    .in('room_id', roomIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return data as JoinRequest[];
}

export async function createRequest(roomId: string, userId: string, message?: string): Promise<JoinRequest | null> {
  const { data, error } = await supabase
    .from('join_requests')
    .insert({
      room_id: roomId,
      user_id: userId,
      message,
      status: 'pending',
    })
    .select(`
      *,
      user:profiles(*),
      room:rooms(*)
    `)
    .single();

  if (error) {
    console.error('Error creating request:', error);
    return null;
  }

  return data as JoinRequest;
}

export async function updateRequest(id: string, status: 'approved' | 'rejected'): Promise<JoinRequest | null> {
  const { data, error } = await supabase
    .from('join_requests')
    .update({ status })
    .eq('id', id)
    .select(`
      *,
      user:profiles(*),
      room:rooms(*)
    `)
    .single();

  if (error) {
    console.error('Error updating request:', error);
    return null;
  }

  // If approved, add the user as a participant
  if (status === 'approved' && data) {
    await addParticipant(data.room_id, data.user_id);
  }

  return data as JoinRequest;
}

export async function hasUserRequestedRoom(userId: string, roomId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('join_requests')
    .select('id')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    console.error('Error checking user request:', error);
    return false;
  }

  return !!data;
}

// ============ Participant Functions ============

export async function getParticipants(roomId: string): Promise<RoomParticipant[]> {
  const { data, error } = await supabase
    .from('room_participants')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }

  return data as RoomParticipant[];
}

export async function addParticipant(roomId: string, userId: string): Promise<RoomParticipant | null> {
  const { data, error } = await supabase
    .from('room_participants')
    .insert({
      room_id: roomId,
      user_id: userId,
    })
    .select(`
      *,
      user:profiles(*)
    `)
    .single();

  if (error) {
    // Might be duplicate, which is fine
    if (error.code === '23505') {
      return null;
    }
    console.error('Error adding participant:', error);
    return null;
  }

  return data as RoomParticipant;
}

export async function isUserInRoom(userId: string, roomId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('room_participants')
    .select('id')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if user in room:', error);
    return false;
  }

  return !!data;
}

export async function getJoinedRooms(userId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('room_participants')
    .select(`
      room:rooms(*, stadium:stadiums(*), creator:profiles(*))
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching joined rooms:', error);
    return [];
  }

  return data.map(d => d.room).filter(Boolean) as Room[];
}

// ============ Player Stats Functions ============

export async function getPlayerStats(userId: string): Promise<PlayerStats | null> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching player stats:', error);
    }
    return null;
  }

  return data as PlayerStats;
}

export async function getTopPlayers(limit: number = 10): Promise<(PlayerStats & { user?: User })[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      *,
      user:profiles(*)
    `)
    .gt('total_ratings', 0)
    .order('overall', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top players:', error);
    return [];
  }

  return data as (PlayerStats & { user?: User })[];
}

// ============ Player Rating Functions ============

export async function submitRating(
  roomId: string,
  raterId: string,
  ratedId: string,
  rating: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
  }
): Promise<PlayerRating | null> {
  const { data, error } = await supabase
    .from('player_ratings')
    .insert({
      room_id: roomId,
      rater_id: raterId,
      rated_id: ratedId,
      ...rating,
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting rating:', error);
    return null;
  }

  return data as PlayerRating;
}

export async function hasUserRatedInRoom(userId: string, roomId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('player_ratings')
    .select('id')
    .eq('rater_id', userId)
    .eq('room_id', roomId)
    .limit(1);

  if (error) {
    console.error('Error checking if user rated:', error);
    return false;
  }

  return data.length > 0;
}

export async function getRatingsForPlayer(userId: string): Promise<PlayerRating[]> {
  const { data, error } = await supabase
    .from('player_ratings')
    .select('*')
    .eq('rated_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching player ratings:', error);
    return [];
  }

  return data as PlayerRating[];
}

export async function getRatingsForRoom(roomId: string): Promise<PlayerRating[]> {
  const { data, error } = await supabase
    .from('player_ratings')
    .select('*')
    .eq('room_id', roomId);

  if (error) {
    console.error('Error fetching room ratings:', error);
    return [];
  }

  return data as PlayerRating[];
}

// ============ Admin Functions ============

export async function getAdminStats() {
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: activeMatches } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'open');
  const { count: totalStadiums } = await supabase.from('stadiums').select('*', { count: 'exact', head: true });
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: matchesThisWeek } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
  return {
    total_users: totalUsers || 0,
    active_matches: activeMatches || 0,
    total_stadiums: totalStadiums || 0,
    matches_this_week: matchesThisWeek || 0,
  };
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []) as User[];
}

export async function deleteRoom(roomId: string) {
  await supabase.from('chat_messages').delete().eq('room_id', roomId);
  await supabase.from('player_ratings').delete().eq('room_id', roomId);
  await supabase.from('notifications').delete().eq('room_id', roomId);
  await supabase.from('room_participants').delete().eq('room_id', roomId);
  await supabase.from('join_requests').delete().eq('room_id', roomId);
  await supabase.from('rooms').delete().eq('id', roomId);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
  return data?.is_admin === true;
}

// ============ Waitlist Functions ============

export async function getWaitlistForRoom(roomId: string): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from('waitlist')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    // Table might not exist yet; return empty
    if (error.code === '42P01') return [];
    console.error('Error fetching waitlist:', error);
    return [];
  }

  return data as WaitlistEntry[];
}

export async function joinWaitlist(roomId: string, userId: string): Promise<WaitlistEntry | null> {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({ room_id: roomId, user_id: userId })
    .select(`*, user:profiles(*)`)
    .single();

  if (error) {
    console.error('Error joining waitlist:', error);
    return null;
  }

  return data as WaitlistEntry;
}

export async function isUserOnWaitlist(userId: string, roomId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('waitlist')
    .select('id')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') return false;
    console.error('Error checking waitlist:', error);
    return false;
  }

  return !!data;
}

export async function leaveWaitlist(userId: string, roomId: string): Promise<void> {
  const { error } = await supabase
    .from('waitlist')
    .delete()
    .eq('user_id', userId)
    .eq('room_id', roomId);

  if (error) {
    console.error('Error leaving waitlist:', error);
  }
}
