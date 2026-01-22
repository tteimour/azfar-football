export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  age?: number;
  preferred_position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  bio?: string;
  avatar_url?: string;
  games_played: number;
  created_at: string;
}

export interface Stadium {
  id: string;
  name: string;
  address: string;
  district: string;
  capacity: number;
  price_per_hour: number;
  amenities: string[];
  image_url: string;
  latitude: number;
  longitude: number;
}

export interface Room {
  id: string;
  title: string;
  stadium_id: string;
  stadium?: Stadium;
  creator_id: string;
  creator?: User;
  date: string;
  start_time: string;
  end_time: string;
  max_players: number;
  current_players: number;
  skill_level_required: 'any' | 'beginner' | 'intermediate' | 'advanced' | 'professional';
  description?: string;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  created_at: string;
}

export interface JoinRequest {
  id: string;
  room_id: string;
  room?: Room;
  user_id: string;
  user?: User;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  created_at: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  user?: User;
  joined_at: string;
}
