/**
 * Copyright 2026 Dotori Tools
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Google Authentication & User Profile Management for Dotori Flow

export const STORAGE_KEY_GOOGLE_USER = 'dotori_flow_google_user_v1';

// Admin emails configured via VITE_ADMIN_EMAILS (comma-separated)
const ENV_ADMIN_EMAILS = (import.meta.env?.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS = ENV_ADMIN_EMAILS;

// Quick Select Demo Profiles (no personal info)
export const PRESET_GOOGLE_ACCOUNTS = [
  {
    id: 'demo_admin',
    name: '관리자 (Admin Demo)',
    email: 'admin@example.com',
    picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin-demo',
    role: 'Admin',
    isAdmin: true,
    description: '필드 관리 및 전체 기능 체험용 관리자 프로필'
  },
  {
    id: 'demo_member',
    name: '일반 사용자 (Member Demo)',
    email: 'member@example.com',
    picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=member-demo',
    role: 'Member',
    isAdmin: false,
    description: '버그 리포트 작성 및 일반 협업 체험용 프로필'
  }
];

/**
 * Decode JWT token returned by Google Identity Services (GIS)
 */
export function decodeJwtResponse(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT credential:', err);
    return null;
  }
}

/**
 * Check if the given email has administrative rights
 */
export function checkIsAdminEmail(email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  return ADMIN_EMAILS.some(e => e.toLowerCase() === normalized);
}

/**
 * Retrieve saved Google user from LocalStorage
 */
export function getStoredGoogleUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOOGLE_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.email) {
      // Re-evaluate admin privilege based on verified email list
      user.isAdmin = user.isAdmin || checkIsAdminEmail(user.email);
      return user;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Persist Google user profile in LocalStorage
 */
export function saveStoredGoogleUser(user) {
  if (!user) return;
  const enrichedUser = {
    ...user,
    isAdmin: user.isAdmin || checkIsAdminEmail(user.email),
    loggedInAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY_GOOGLE_USER, JSON.stringify(enrichedUser));
  return enrichedUser;
}

/**
 * Remove stored Google user
 */
export function removeStoredGoogleUser() {
  localStorage.removeItem(STORAGE_KEY_GOOGLE_USER);
}

