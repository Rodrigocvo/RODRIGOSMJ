import { User } from '../types';

export const MASTER_ADMIN_CREDENTIALS = {
  email: 'rodrigotricollo1990@gmail.com',
  alternateLogins: ['admin@ruivinhavip.com', 'admin', 'rodrigotricollo1990@gmail.com'],
  password: 'adm123456',
  alternatePasswords: ['adm123456', 'admin123', 'admin'],
};

export const DEFAULT_USER: User = {
  id: 'user-client-1',
  name: 'Cliente Visitante',
  email: 'cliente@email.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  isVip: false,
  role: 'user',
  unlockedPostIds: [],
  tipsSentTotal: 0,
  createdAt: new Date().toISOString(),
};

export const ADMIN_USER: User = {
  id: 'user-admin-master',
  name: 'Rodrigo (Administrador)',
  email: 'rodrigotricollo1990@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '(11) 99999-8888',
  isVip: true,
  role: 'admin',
  unlockedPostIds: [],
  tipsSentTotal: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEMO_USERS: User[] = [
  DEFAULT_USER,
  ADMIN_USER,
];

const STORAGE_USER_KEY = 'ruivinha_current_user_v4';
const STORAGE_REGISTERED_USERS = 'ruivinha_registered_users_v4';
const STORAGE_PASSWORDS_KEY = 'ruivinha_passwords_v4';

export function verifyAdminCredentials(login: string, pass: string): boolean {
  const cleanLogin = login.trim().toLowerCase();
  const cleanPass = pass.trim();

  const isLoginMatch = MASTER_ADMIN_CREDENTIALS.alternateLogins.some(
    (l) => l.toLowerCase() === cleanLogin
  );
  const isPassMatch = MASTER_ADMIN_CREDENTIALS.alternatePasswords.some(
    (p) => p === cleanPass
  );

  return isLoginMatch && isPassMatch;
}

export function getRegisteredUsers(): User[] {
  try {
    const saved = localStorage.getItem(STORAGE_REGISTERED_USERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load registered users', err);
  }
  return DEMO_USERS;
}

export function saveRegisteredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users', err);
  }
}

export function saveUserPassword(email: string, pass: string): void {
  try {
    const saved = localStorage.getItem(STORAGE_PASSWORDS_KEY);
    const map = saved ? JSON.parse(saved) : {};
    map[email.toLowerCase()] = pass;
    localStorage.setItem(STORAGE_PASSWORDS_KEY, JSON.stringify(map));
  } catch {}
}

export function getUserPassword(email: string): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_PASSWORDS_KEY);
    if (saved) {
      const map = JSON.parse(saved);
      return map[email.toLowerCase()] || null;
    }
  } catch {}
  return null;
}

export function getCurrentUser(): User | null {
  try {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load current user', err);
  }
  return DEFAULT_USER;
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user', err);
  }
}

export const saveCurrentUser = setCurrentUser;

export function logoutUser(): void {
  setCurrentUser(DEFAULT_USER);
}

