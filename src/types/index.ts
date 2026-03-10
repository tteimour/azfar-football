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
  is_admin?: boolean;
  banned_at?: string;
  cover_photo?: string;
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
  stadium_id?: string;
  stadium?: Stadium;
  // Inline stadium fields (for custom stadium entry)
  stadium_name: string;
  stadium_address?: string;
  stadium_price_per_hour?: number;
  stadium_latitude?: number;
  stadium_longitude?: number;
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

export interface PlayerStats {
  id: string;
  user_id: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  overall: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerRating {
  id: string;
  room_id: string;
  rater_id: string;
  rated_id: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  room_id: string;
  user_id: string;
  user?: User;
  created_at: string;
}

export type NotificationType = 'join_request' | 'request_approved' | 'request_rejected' | 'match_reminder' | 'match_completed' | 'match_cancelled';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  room_id?: string;
  related_user_id?: string;
  related_user?: User;
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user?: User;
  message: string;
  created_at: string;
}

export interface AdminUser extends User {
  is_admin: boolean;
  banned_at?: string;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  preferred_position: User['preferred_position'];
  skill_level: User['skill_level'];
  avatar_url?: string;
  games_played: number;
  bio?: string;
  player_stats?: PlayerStats;
}

export type OAuthProvider = 'google' | 'github';

export interface AdminStats {
  total_users: number;
  active_matches: number;
  total_stadiums: number;
  matches_this_week: number;
}

export interface StadiumForm {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  amenities: string[];
  capacity: number;
  image_url: string;
}
