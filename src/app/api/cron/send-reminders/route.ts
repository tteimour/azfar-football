import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMatchReminder, isEmailConfigured } from '@/lib/email';

export const runtime = 'nodejs';

interface RoomWithParticipants {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  stadium_name: string;
  stadium_address: string | null;
  participants: {
    user: {
      id: string;
      email: string;
      full_name: string;
    } | null;
  }[];
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if email is configured
  if (!isEmailConfigured()) {
    return NextResponse.json({
      success: false,
      message: 'Email not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM environment variables.',
    });
  }

  // Check for required Supabase env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      success: false,
      message: 'Supabase not configured. This endpoint only works in production mode.',
    });
  }

  // Create admin Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Find matches starting in approximately 2 hours (1.5 to 2.5 hours from now)
    const now = new Date();
    const minTime = new Date(now.getTime() + 90 * 60 * 1000); // 1.5 hours from now
    const maxTime = new Date(now.getTime() + 150 * 60 * 1000); // 2.5 hours from now

    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get rooms with their participants
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select(`
        id,
        title,
        date,
        start_time,
        end_time,
        stadium_name,
        stadium_address,
        participants:room_participants(
          user:profiles(id, email, full_name)
        )
      `)
      .in('date', [today, tomorrow])
      .eq('status', 'open');

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms',
      }, { status: 500 });
    }

    // Filter rooms where the match starts in the 2-hour window
    const eligibleRooms = (rooms as RoomWithParticipants[]).filter((room) => {
      const [hours, minutes] = room.start_time.split(':').map(Number);
      const matchDate = new Date(room.date);
      matchDate.setHours(hours, minutes, 0, 0);

      return matchDate >= minTime && matchDate <= maxTime;
    });

    if (eligibleRooms.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches starting in the next 2 hours',
        emailsSent: 0,
      });
    }

    // Track sent notifications to avoid duplicates
    const sentNotifications: { roomId: string; userId: string; }[] = [];

    // Check which notifications have already been sent
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('room_id, user_id')
      .eq('type', 'match_reminder')
      .in('room_id', eligibleRooms.map(r => r.id));

    const existingSet = new Set(
      (existingNotifications || []).map(n => `${n.room_id}:${n.user_id}`)
    );

    let emailsSent = 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zapolya.football';

    for (const room of eligibleRooms) {
      const formattedDate = new Date(room.date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      for (const participant of room.participants) {
        const user = participant.user;
        if (!user || !user.email) continue;

        // Skip if already notified
        const key = `${room.id}:${user.id}`;
        if (existingSet.has(key)) continue;

        // Send email
        const sent = await sendMatchReminder({
          to: user.email,
          playerName: user.full_name,
          matchTitle: room.title,
          stadiumName: room.stadium_name,
          stadiumAddress: room.stadium_address || undefined,
          date: formattedDate,
          startTime: room.start_time,
          endTime: room.end_time,
          roomUrl: `${baseUrl}/rooms/${room.id}`,
        });

        if (sent) {
          emailsSent++;
          sentNotifications.push({ roomId: room.id, userId: user.id });

          // Create a notification record in the database
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'match_reminder',
            title: 'Match Reminder',
            message: `Your match "${room.title}" starts in about 2 hours!`,
            room_id: room.id,
            is_read: false,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent} reminder emails`,
      emailsSent,
      roomsChecked: eligibleRooms.length,
    });
  } catch (error) {
    console.error('Error in send-reminders cron:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
