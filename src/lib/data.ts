'use client';

import { isDemoMode } from './supabase';
import * as store from './store';
import * as database from './database';
import { Room, Stadium, JoinRequest, RoomParticipant, PlayerStats, PlayerRating, User } from '@/types';

// Unified data layer that routes between demo (localStorage) and production (Supabase)

// ============ Stadium Functions ============

export async function getStadiums(): Promise<Stadium[]> {
  if (isDemoMode) {
    return store.getStadiums();
  }
  return database.getStadiums();
}

export async function getStadium(id: string): Promise<Stadium | null> {
  if (isDemoMode) {
    return store.getStadium(id) || null;
  }
  return database.getStadium(id);
}

// ============ Room Functions ============

export async function getRooms(): Promise<Room[]> {
  if (isDemoMode) {
    return store.getRooms();
  }
  return database.getRooms();
}

export async function getRoom(id: string): Promise<Room | null> {
  if (isDemoMode) {
    return store.getRoom(id);
  }
  return database.getRoom(id);
}

export async function getMyRooms(userId: string): Promise<Room[]> {
  if (isDemoMode) {
    return store.getMyRooms(userId);
  }
  return database.getMyRooms(userId);
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
  if (isDemoMode) {
    return store.createRoom(room);
  }
  return database.createRoom(room);
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
  if (isDemoMode) {
    return store.updateRoom(id, updates);
  }
  return database.updateRoom(id, updates);
}

// ============ Join Request Functions ============

export async function getRequestsForRoom(roomId: string): Promise<JoinRequest[]> {
  if (isDemoMode) {
    return store.getRequestsForRoom(roomId);
  }
  return database.getRequestsForRoom(roomId);
}

export async function getRequestsForUser(userId: string): Promise<JoinRequest[]> {
  if (isDemoMode) {
    return store.getRequestsForUser(userId);
  }
  return database.getRequestsForUser(userId);
}

export async function getPendingRequestsForMyRooms(userId: string): Promise<JoinRequest[]> {
  if (isDemoMode) {
    return store.getPendingRequestsForMyRooms(userId);
  }
  return database.getPendingRequestsForMyRooms(userId);
}

export async function createRequest(roomId: string, userId: string, message?: string): Promise<JoinRequest | null> {
  if (isDemoMode) {
    return store.createRequest(roomId, userId, message);
  }
  return database.createRequest(roomId, userId, message);
}

export async function updateRequest(id: string, status: 'approved' | 'rejected'): Promise<JoinRequest | null> {
  if (isDemoMode) {
    return store.updateRequest(id, status);
  }
  return database.updateRequest(id, status);
}

export async function hasUserRequestedRoom(userId: string, roomId: string): Promise<boolean> {
  if (isDemoMode) {
    return store.hasUserRequestedRoom(userId, roomId);
  }
  return database.hasUserRequestedRoom(userId, roomId);
}

// ============ Participant Functions ============

export async function getParticipants(roomId: string): Promise<RoomParticipant[]> {
  if (isDemoMode) {
    return store.getParticipants(roomId);
  }
  return database.getParticipants(roomId);
}

export async function addParticipant(roomId: string, userId: string): Promise<RoomParticipant | null> {
  if (isDemoMode) {
    return store.addParticipant(roomId, userId);
  }
  return database.addParticipant(roomId, userId);
}

export async function isUserInRoom(userId: string, roomId: string): Promise<boolean> {
  if (isDemoMode) {
    return store.isUserInRoom(userId, roomId);
  }
  return database.isUserInRoom(userId, roomId);
}

export async function getJoinedRooms(userId: string): Promise<Room[]> {
  if (isDemoMode) {
    return store.getJoinedRooms(userId);
  }
  return database.getJoinedRooms(userId);
}

// ============ Player Stats Functions ============

export async function getPlayerStats(userId: string): Promise<PlayerStats | null> {
  if (isDemoMode) {
    return store.getPlayerStats(userId);
  }
  return database.getPlayerStats(userId);
}

export async function getTopPlayers(limit: number = 10): Promise<(PlayerStats & { user?: User })[]> {
  if (isDemoMode) {
    return store.getTopPlayers(limit);
  }
  return database.getTopPlayers(limit);
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
  if (isDemoMode) {
    return store.submitRating(roomId, raterId, ratedId, rating);
  }
  return database.submitRating(roomId, raterId, ratedId, rating);
}

export async function hasUserRatedInRoom(userId: string, roomId: string): Promise<boolean> {
  if (isDemoMode) {
    return store.hasUserRatedInRoom(userId, roomId);
  }
  return database.hasUserRatedInRoom(userId, roomId);
}

export async function getRatingsForPlayer(userId: string): Promise<PlayerRating[]> {
  if (isDemoMode) {
    return store.getRatingsForPlayer(userId);
  }
  return database.getRatingsForPlayer(userId);
}

export async function getRatingsForRoom(roomId: string): Promise<PlayerRating[]> {
  if (isDemoMode) {
    return store.getRatingsForRoom(roomId);
  }
  return database.getRatingsForRoom(roomId);
}
