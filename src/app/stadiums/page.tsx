'use client';

import React, { useEffect, useState } from 'react';
import { getStadiums, getRooms } from '@/lib/store';
import { Stadium, Room } from '@/types';
import Link from 'next/link';
import { MapPin, Users, Car, Coffee, Lightbulb, ShowerHead, Building, Calendar } from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
  'Parking': <Car className="w-4 h-4" />,
  'Cafeteria': <Coffee className="w-4 h-4" />,
  'Night Lighting': <Lightbulb className="w-4 h-4" />,
  'Showers': <ShowerHead className="w-4 h-4" />,
  'Changing Rooms': <Building className="w-4 h-4" />,
};

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    setStadiums(getStadiums());
    setRooms(getRooms().filter(r => r.status === 'open'));
  }, []);

  const getUpcomingMatchesCount = (stadiumId: string) => {
    return rooms.filter(r => r.stadium_id === stadiumId).length;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Azfar Stadiums</h1>
          <p className="text-gray-400 mt-2">Premium artificial turf fields across Baku</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => {
          const matchCount = getUpcomingMatchesCount(stadium.id);
          return (
            <div key={stadium.id} className="card hover:border-green-500/50 transition-colors">
              {/* Stadium Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <Building className="w-20 h-20 text-green-500/30" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
                  <h3 className="font-bold text-lg">{stadium.name}</h3>
                </div>
              </div>

              {/* Stadium Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{stadium.district}</span>
                  </div>
                  <span className="text-green-500 font-bold">{stadium.price_per_hour} AZN/hr</span>
                </div>

                <p className="text-sm text-gray-400">{stadium.address}</p>

                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{stadium.capacity} players</span>
                  </div>
                  {matchCount > 0 && (
                    <div className="flex items-center space-x-1 text-green-500">
                      <Calendar className="w-4 h-4" />
                      <span>{matchCount} upcoming</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {stadium.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center space-x-1 text-xs bg-gray-700/50 px-2 py-1 rounded-full text-gray-300"
                      >
                        {amenityIcons[amenity] || <Building className="w-3 h-3" />}
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <Link
                  href={`/rooms?stadium=${stadium.id}`}
                  className="btn-primary w-full text-center block mt-4"
                >
                  View Matches
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
