'use client';

import { supabase, isDemoMode } from './supabase';

const AVATAR_BUCKET = 'avatars';

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  if (isDemoMode) {
    // In demo mode, create a local object URL (will be lost on page refresh)
    const objectUrl = URL.createObjectURL(file);
    // Store in localStorage for persistence in demo mode
    try {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem(`avatar_${userId}`, base64);
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error storing avatar in demo mode:', error);
      return objectUrl;
    }
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Remove old avatar if exists
  const { data: existingFiles } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list('', {
      search: userId,
    });

  if (existingFiles && existingFiles.length > 0) {
    const filesToRemove = existingFiles.map((f) => f.name);
    await supabase.storage.from(AVATAR_BUCKET).remove(filesToRemove);
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return null;
  }

  // Get public URL
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
}

export function getStoredAvatar(userId: string): string | null {
  if (typeof window === 'undefined') return null;

  if (isDemoMode) {
    return localStorage.getItem(`avatar_${userId}`);
  }

  return null;
}

export async function deleteAvatar(userId: string): Promise<boolean> {
  if (isDemoMode) {
    localStorage.removeItem(`avatar_${userId}`);
    return true;
  }

  const { data: existingFiles } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list('', {
      search: userId,
    });

  if (existingFiles && existingFiles.length > 0) {
    const filesToRemove = existingFiles.map((f) => f.name);
    const { error } = await supabase.storage.from(AVATAR_BUCKET).remove(filesToRemove);

    if (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  }

  return true;
}
