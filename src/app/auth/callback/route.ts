import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/auth?error=Configuration error', requestUrl.origin)
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      // Successful confirmation - redirect to home
      return NextResponse.redirect(new URL('/?confirmed=true', requestUrl.origin));
    } catch (err) {
      console.error('Unexpected error during code exchange:', err);
      return NextResponse.redirect(
        new URL('/auth?error=An unexpected error occurred', requestUrl.origin)
      );
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
}
