'use client';

import { User, Room, JoinRequest, RoomParticipant, PlayerStats, PlayerRating, WaitlistEntry } from '@/types';
import { sampleStadiums, sampleRooms, sampleUsers } from './sample-data';

// Simple in-memory store for demo purposes
// In production, this would be replaced with Supabase queries

const STORAGE_KEYS = {
  USER: 'tapadam_current_user',
  ROOMS: 'tapadam_rooms',
  REQUESTS: 'tapadam_requests',
  PARTICIPANTS: 'tapadam_participants',
  PLAYER_STATS: 'tapadam_player_stats',
  PLAYER_RATINGS: 'tapadam_player_ratings',
  WAITLIST: 'tapadam_waitlist',
  USERS_REGISTRY: 'tapadam_users_registry',
};

// Initialize data in localStorage if not present
export function initializeStore() {
  if (typeof window === 'undefined') return;

  // One-time migration: remove old sample rooms that were seeded before
  const MIGRATION_KEY = 'tapadam_v2_cleaned';
  if (!localStorage.getItem(MIGRATION_KEY)) {
    const existingRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (existingRooms) {
      try {
        const rooms = JSON.parse(existingRooms);
        const sampleTitles = ['Saturday Evening Match', 'Competitive 7v7', 'Sunday Morning Football'];
        const cleaned = rooms.filter((r: Room) => !sampleTitles.includes(r.title));
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(cleaned));
      } catch { /* ignore parse errors */ }
    }
    localStorage.setItem(MIGRATION_KEY, '1');
  }

  if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(sampleRooms));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify([]));
  }
}

// Generate a stable ID from email so the same user always gets the same ID
export function generateStableId(email: string): string {
  let hash = 0;
  const str = email.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `demo_${Math.abs(hash).toString(36)}`;
}

// Registry maps email → User so re-logins restore the same user object
export function getUserByEmail(email: string): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY);
  if (!data) return null;
  const registry: Record<string, User> = JSON.parse(data);
  return registry[email.toLowerCase()] || null;
}

export function registerUserInRegistry(user: User) {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY);
  const registry: Record<string, User> = data ? JSON.parse(data) : {};
  registry[user.email.toLowerCase()] = user;
  localStorage.setItem(STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(registry));
}

export function updateUserInRegistry(updates: Partial<User> & { email: string }) {
  if (typeof window === 'undefined') return;
  const existing = getUserByEmail(updates.email);
  if (!existing) return;
  const updated = { ...existing, ...updates };
  registerUserInRegistry(updated);
}

// User functions
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export function updateCurrentUser(updates: Partial<User>): User | null {
  const user = getCurrentUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  setCurrentUser(updated);
  return updated;
}

export function getUserById(userId: string): User | null {
  // Check current user
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) return currentUser;
  // Check sample users
  const sampleUser = sampleUsers.find(u => u.id === userId);
  if (sampleUser) return sampleUser;
  // Scan the users registry by ID
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY);
    if (data) {
      const registry: Record<string, User> = JSON.parse(data);
      const found = Object.values(registry).find(u => u.id === userId);
      if (found) return found;
    }
  }
  return null;
}

export function getPublicProfile(userId: string): User | null {
  return getUserById(userId);
}

// Room functions
export function getRooms(): Room[] {
  if (typeof window === 'undefined') return sampleRooms;
  const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
  const rooms = data ? JSON.parse(data) : sampleRooms;
  // Attach stadium and creator data
  return rooms.map((room: Room) => ({
    ...room,
    stadium: sampleStadiums.find(s => s.id === room.stadium_id),
    creator: getUserById(room.creator_id) || undefined,
  }));
}

export function getRoom(id: string): Room | null {
  const rooms = getRooms();
  return rooms.find(r => r.id === id) || null;
}

export function createRoom(room: {
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
}): Room {
  const rooms = getRooms();
  const newRoom: Room = {
    id: Date.now().toString(),
    title: room.title,
    description: room.description,
    stadium_id: room.stadium_id,
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
    skill_level_required: room.skill_level_required as Room['skill_level_required'],
    current_players: 1,
    status: 'open',
    created_at: new Date().toISOString(),
    stadium: room.stadium_id ? sampleStadiums.find(s => s.id === room.stadium_id) : undefined,
  };
  rooms.push(newRoom);
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

  // Add creator as participant
  addParticipant(newRoom.id, room.creator_id);

  return newRoom;
}

export function updateRoom(id: string, updates: Partial<Room>): Room | null {
  const rooms = getRooms();
  const index = rooms.findIndex(r => r.id === id);
  if (index === -1) return null;

  rooms[index] = { ...rooms[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  return rooms[index];
}

export function getMyRooms(userId: string): Room[] {
  return getRooms().filter(r => r.creator_id === userId);
}

// Join Request functions
export function getRequests(): JoinRequest[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function getRequestsForRoom(roomId: string): JoinRequest[] {
  return getRequests().filter(r => r.room_id === roomId);
}

export function getRequestsForUser(userId: string): JoinRequest[] {
  return getRequests().filter(r => r.user_id === userId);
}

export function getPendingRequestsForMyRooms(userId: string): JoinRequest[] {
  const myRooms = getMyRooms(userId);
  const roomIds = myRooms.map(r => r.id);
  return getRequests().filter(r => roomIds.includes(r.room_id) && r.status === 'pending');
}

export function createRequest(roomId: string, userId: string, message?: string): JoinRequest {
  const requests = getRequests();
  const user = getCurrentUser();
  const room = getRoom(roomId);

  const newRequest: JoinRequest = {
    id: Date.now().toString(),
    room_id: roomId,
    room: room || undefined,
    user_id: userId,
    user: user || undefined,
    status: 'pending',
    message,
    created_at: new Date().toISOString(),
  };

  requests.push(newRequest);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return newRequest;
}

export function updateRequest(id: string, status: 'approved' | 'rejected'): JoinRequest | null {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;

  requests[index].status = status;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // If approved, add as participant and update room count
  if (status === 'approved') {
    const request = requests[index];
    addParticipant(request.room_id, request.user_id);
    const room = getRoom(request.room_id);
    if (room) {
      updateRoom(request.room_id, { current_players: room.current_players + 1 });
    }
  }

  return requests[index];
}

export function hasUserRequestedRoom(userId: string, roomId: string): boolean {
  return getRequests().some(r => r.user_id === userId && r.room_id === roomId);
}

// Participant functions
export function getParticipants(roomId: string): RoomParticipant[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
  const all = data ? JSON.parse(data) : [];
  return all
    .filter((p: RoomParticipant) => p.room_id === roomId)
    .map((p: RoomParticipant) => ({
      ...p,
      user: getUserById(p.user_id) || undefined,
    }));
}

export function addParticipant(roomId: string, userId: string): RoomParticipant {
  const participants = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]');
  const newParticipant: RoomParticipant = {
    id: Date.now().toString(),
    room_id: roomId,
    user_id: userId,
    joined_at: new Date().toISOString(),
  };
  participants.push(newParticipant);
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  return newParticipant;
}

export function isUserInRoom(userId: string, roomId: string): boolean {
  const participants = getParticipants(roomId);
  return participants.some(p => p.user_id === userId);
}

export function getJoinedRooms(userId: string): Room[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
  const participants = data ? JSON.parse(data) : [];
  const roomIds = participants
    .filter((p: RoomParticipant) => p.user_id === userId)
    .map((p: RoomParticipant) => p.room_id);
  return getRooms().filter(r => roomIds.includes(r.id));
}

// Stadiums
export function getStadiums() {
  return sampleStadiums;
}

export function getStadium(id: string) {
  return sampleStadiums.find(s => s.id === id);
}

// ============ Player Stats Functions ============

function getPlayerStatsStore(): Map<string, PlayerStats> {
  if (typeof window === 'undefined') return new Map();
  const data = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
  if (!data) return new Map();
  const parsed = JSON.parse(data);
  return new Map(Object.entries(parsed));
}

function savePlayerStatsStore(store: Map<string, PlayerStats>) {
  const obj: Record<string, PlayerStats> = {};
  store.forEach((value, key) => {
    obj[key] = value;
  });
  localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(obj));
}

export function getPlayerStats(userId: string): PlayerStats | null {
  const store = getPlayerStatsStore();
  return store.get(userId) || null;
}

export function getTopPlayers(limit: number = 10): (PlayerStats & { user?: User })[] {
  const store = getPlayerStatsStore();
  const stats = Array.from(store.values())
    .filter(s => s.total_ratings > 0)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, limit);

  // Attach user data (would need to look up from demo users)
  return stats.map(s => ({
    ...s,
    user: getCurrentUser()?.id === s.user_id ? getCurrentUser() || undefined : undefined,
  }));
}

// ============ Player Rating Functions ============

function getPlayerRatingsStore(): PlayerRating[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PLAYER_RATINGS);
  return data ? JSON.parse(data) : [];
}

function savePlayerRatingsStore(ratings: PlayerRating[]) {
  localStorage.setItem(STORAGE_KEYS.PLAYER_RATINGS, JSON.stringify(ratings));
}

function updatePlayerStatsFromRatings(userId: string) {
  const ratings = getPlayerRatingsStore().filter(r => r.rated_id === userId);
  if (ratings.length === 0) return;

  const avgPace = Math.round(ratings.reduce((sum, r) => sum + r.pace, 0) / ratings.length);
  const avgShooting = Math.round(ratings.reduce((sum, r) => sum + r.shooting, 0) / ratings.length);
  const avgPassing = Math.round(ratings.reduce((sum, r) => sum + r.passing, 0) / ratings.length);
  const avgDribbling = Math.round(ratings.reduce((sum, r) => sum + r.dribbling, 0) / ratings.length);
  const avgDefense = Math.round(ratings.reduce((sum, r) => sum + r.defense, 0) / ratings.length);
  const avgPhysical = Math.round(ratings.reduce((sum, r) => sum + r.physical, 0) / ratings.length);
  const overall = Math.round((avgPace + avgShooting + avgPassing + avgDribbling + avgDefense + avgPhysical) / 6);

  const store = getPlayerStatsStore();
  const existingStats = store.get(userId);

  const updatedStats: PlayerStats = {
    id: existingStats?.id || Date.now().toString(),
    user_id: userId,
    pace: avgPace,
    shooting: avgShooting,
    passing: avgPassing,
    dribbling: avgDribbling,
    defense: avgDefense,
    physical: avgPhysical,
    overall,
    total_ratings: ratings.length,
    created_at: existingStats?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.set(userId, updatedStats);
  savePlayerStatsStore(store);
}

export function submitRating(
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
): PlayerRating {
  const ratings = getPlayerRatingsStore();

  const newRating: PlayerRating = {
    id: Date.now().toString(),
    room_id: roomId,
    rater_id: raterId,
    rated_id: ratedId,
    ...rating,
    created_at: new Date().toISOString(),
  };

  ratings.push(newRating);
  savePlayerRatingsStore(ratings);

  // Update player stats
  updatePlayerStatsFromRatings(ratedId);

  return newRating;
}

export function hasUserRatedInRoom(userId: string, roomId: string): boolean {
  const ratings = getPlayerRatingsStore();
  return ratings.some(r => r.rater_id === userId && r.room_id === roomId);
}

export function getRatingsForPlayer(userId: string): PlayerRating[] {
  return getPlayerRatingsStore().filter(r => r.rated_id === userId);
}

export function getRatingsForRoom(roomId: string): PlayerRating[] {
  return getPlayerRatingsStore().filter(r => r.room_id === roomId);
}

// ============ Admin Functions ============

export function getAdminStats() {
  const rooms = getRooms();
  return {
    total_users: sampleUsers.length,
    active_matches: rooms.filter(r => r.status === 'open').length,
    total_stadiums: sampleStadiums.length,
    matches_this_week: 2,
  };
}

export function getAllUsers(): User[] {
  return sampleUsers;
}

export function deleteRoom(roomId: string) {
  if (typeof window === 'undefined') return;
  // Remove the room
  const rooms = getRooms();
  const filtered = rooms.filter(r => r.id !== roomId);
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(filtered));
  // Remove related participants
  const participants = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]');
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(
    participants.filter((p: RoomParticipant) => p.room_id !== roomId)
  ));
  // Remove related join requests
  const requests = getRequests();
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(
    requests.filter(r => r.room_id !== roomId)
  ));
  // Remove related ratings
  const ratings = getPlayerRatingsStore();
  savePlayerRatingsStore(ratings.filter(r => r.room_id !== roomId));
  // Remove related waitlist entries
  const waitlist = getWaitlist();
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(
    waitlist.filter(w => w.room_id !== roomId)
  ));
}

// ============ Waitlist Functions ============

function getWaitlist(): WaitlistEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.WAITLIST);
  return data ? JSON.parse(data) : [];
}

export function getWaitlistForRoom(roomId: string): WaitlistEntry[] {
  return getWaitlist().filter(w => w.room_id === roomId);
}

export function joinWaitlist(roomId: string, userId: string): WaitlistEntry {
  const waitlist = getWaitlist();
  const user = getCurrentUser();
  const entry: WaitlistEntry = {
    id: Date.now().toString(),
    room_id: roomId,
    user_id: userId,
    user: user || undefined,
    created_at: new Date().toISOString(),
  };
  waitlist.push(entry);
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
  return entry;
}

export function isUserOnWaitlist(userId: string, roomId: string): boolean {
  return getWaitlist().some(w => w.user_id === userId && w.room_id === roomId);
}

export function leaveWaitlist(userId: string, roomId: string): void {
  const waitlist = getWaitlist().filter(w => !(w.user_id === userId && w.room_id === roomId));
  localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
}
