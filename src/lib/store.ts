'use client';

import { User, Room, JoinRequest, RoomParticipant } from '@/types';
import { sampleStadiums, sampleRooms, sampleUsers } from './sample-data';

// Simple in-memory store for demo purposes
// In production, this would be replaced with Supabase queries

const STORAGE_KEYS = {
  USER: 'azfar_current_user',
  ROOMS: 'azfar_rooms',
  REQUESTS: 'azfar_requests',
  PARTICIPANTS: 'azfar_participants',
};

// Initialize data in localStorage if not present
export function initializeStore() {
  if (typeof window === 'undefined') return;

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

// Room functions
export function getRooms(): Room[] {
  if (typeof window === 'undefined') return sampleRooms;
  const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
  const rooms = data ? JSON.parse(data) : sampleRooms;
  // Attach stadium data
  return rooms.map((room: Room) => ({
    ...room,
    stadium: sampleStadiums.find(s => s.id === room.stadium_id),
  }));
}

export function getRoom(id: string): Room | null {
  const rooms = getRooms();
  return rooms.find(r => r.id === id) || null;
}

export function createRoom(room: Omit<Room, 'id' | 'created_at' | 'current_players' | 'status'>): Room {
  const rooms = getRooms();
  const newRoom: Room = {
    ...room,
    id: Date.now().toString(),
    current_players: 1,
    status: 'open',
    created_at: new Date().toISOString(),
    stadium: sampleStadiums.find(s => s.id === room.stadium_id),
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
  return all.filter((p: RoomParticipant) => p.room_id === roomId);
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
