import { Stadium, User, Room, JoinRequest } from '@/types';

export const sampleStadiums: Stadium[] = [
  {
    id: '1',
    name: 'Stadium Narimanov',
    address: 'Narimanov district, Tabriz str. 45',
    district: 'Narimanov',
    capacity: 14,
    price_per_hour: 80,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'Night Lighting'],
    image_url: '/stadium-1.jpg',
    latitude: 40.4093,
    longitude: 49.8671,
  },
  {
    id: '2',
    name: 'Stadium Yasamal',
    address: 'Yasamal district, Sharifzade str. 112',
    district: 'Yasamal',
    capacity: 12,
    price_per_hour: 70,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Night Lighting'],
    image_url: '/stadium-2.jpg',
    latitude: 40.3897,
    longitude: 49.8234,
  },
  {
    id: '3',
    name: 'Stadium Nizami',
    address: 'Nizami district, 28 May str. 78',
    district: 'Nizami',
    capacity: 16,
    price_per_hour: 90,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'Night Lighting', 'VIP Lounge'],
    image_url: '/stadium-3.jpg',
    latitude: 40.3777,
    longitude: 49.8520,
  },
  {
    id: '4',
    name: 'Stadium Khirdalan',
    address: 'Khirdalan city, Heyder Aliyev ave. 200',
    district: 'Khirdalan',
    capacity: 14,
    price_per_hour: 60,
    amenities: ['Parking', 'Changing Rooms', 'Night Lighting'],
    image_url: '/stadium-4.jpg',
    latitude: 40.4456,
    longitude: 49.7554,
  },
  {
    id: '5',
    name: 'Stadium Binagadi',
    address: 'Binagadi district, Binagadi highway 25',
    district: 'Binagadi',
    capacity: 14,
    price_per_hour: 75,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'Night Lighting'],
    image_url: '/stadium-5.jpg',
    latitude: 40.4532,
    longitude: 49.8234,
  },
];

export const sampleUsers: User[] = [
  {
    id: '1',
    email: 'demo@tapadam.com',
    full_name: 'Demo User',
    phone: '+994501234567',
    age: 28,
    preferred_position: 'midfielder',
    skill_level: 'intermediate',
    bio: 'Love playing football on weekends. Looking for regular games!',
    games_played: 15,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const sampleRooms: Room[] = [];

export const sampleRequests: JoinRequest[] = [];
