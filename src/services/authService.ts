// src/services/authService.ts
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | string;
  extra?: string;
  role?: string; // keep string so both "Admin" and "admin" work
  password: string;
};

const USERS_KEY = 'pp_users';
const CURRENT_USER_KEY = 'pp_current_user';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const readUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
};
const writeUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

/** Try to fetch user from server by email or phone */
async function fetchUserFromServer(identifier: string): Promise<User | null> {
  try {
    // try by email
    let res = await fetch(`${API}/users?email=${encodeURIComponent(identifier)}`);
    if (!res.ok) throw new Error('server error');
    let arr = await res.json();
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
    // try by phone
    res = await fetch(`${API}/users?phone=${encodeURIComponent(identifier)}`);
    if (!res.ok) throw new Error('server error');
    arr = await res.json();
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
    return null;
  } catch (e) {
    console.warn('fetchUserFromServer failed', e);
    return null;
  }
}

/** dispatch events so other components update */
function notifyUserChanged(user: User | null) {
  try {
    // storage event (may or may not propagate to same window depending on browser)
    window.dispatchEvent(new StorageEvent('storage', { key: CURRENT_USER_KEY, newValue: user ? JSON.stringify(user) : null }));
  } catch (e) {
    // some browsers restrict constructing StorageEvent — ignore
  }
  // custom event always works in same window
  window.dispatchEvent(new CustomEvent('pp_user_changed', { detail: user }));
}

// Hàm helper để gửi POST/PATCH lên server và xử lý lỗi
async function postToServer(endpoint: string, data: any, method: 'POST' | 'PATCH' = 'POST') {
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }
  return response.json();
}

export const authService = {
  register: async (userData: Omit<User, 'id' | 'role'>) => {
    await new Promise((r) => setTimeout(r, 400));

    // Kiểm tra tồn tại trên server trước (để tránh duplicate)
    const existing = await fetch(`${API}/users?email=${encodeURIComponent(userData.email)}`);
    const existingUsers = await existing.json();
    if (existingUsers.length > 0) {
      throw new Error('Email đã tồn tại');
    }

    // Tạo ID và role
    const id = Date.now().toString();
    const user: User = { ...userData, id, role: 'customer' };

    // POST lên server
    await postToServer('/users', user);

    // Sync lại localStorage từ server
    await authService.syncUsersFromServer();

    return user;
  },

  login: async (identifier: string, password: string) => {
    await new Promise((r) => setTimeout(r, 250));
    const cleaned = identifier.trim();

    // 1) try localStorage users first
    let users = readUsers();
    let user = users.find(u => u.email === cleaned || u.phone === cleaned);

    // 2) if not found locally, try server (db.json via json-server)
    if (!user) {
      const serverUser = await fetchUserFromServer(cleaned);
      if (serverUser) {
        user = serverUser as User;
        // optional: persist server users locally for convenience
        users = readUsers();
        if (!users.some(u => u.id === user!.id)) {
          users.push(user);
          writeUsers(users);
        }
      }
    }

    if (!user || user.password !== password) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    notifyUserChanged(user);
    return user;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    notifyUserChanged(null);
  },

  getCurrentUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => !!localStorage.getItem(CURRENT_USER_KEY),

  updateProfile: async (updates: Partial<User> & { id: string }) => {
    await new Promise((r) => setTimeout(r, 300));

    // Cập nhật trên server trước (sử dụng PATCH)
    const updatedFromServer = await postToServer(`/users/${updates.id}`, updates, 'PATCH');

    // Sync localStorage
    await authService.syncUsersFromServer();

    const current = authService.getCurrentUser();
    if (current && current.id === updates.id) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedFromServer));
      notifyUserChanged(updatedFromServer);
    }
    return updatedFromServer;
  },

  promoteToAdmin: async (id: string, confirmIdentifier: string, confirmPassword: string) => {
    await new Promise((r) => setTimeout(r, 300));

    // Fetch user từ server để xác thực
    const userFromServer = await fetch(`${API}/users/${id}`).then(res => res.json());
    if (!userFromServer) throw new Error('User không tồn tại');
    if ((userFromServer.email !== confirmIdentifier && userFromServer.phone !== confirmIdentifier) || userFromServer.password !== confirmPassword) {
      throw new Error('Xác thực không thành công. Vui lòng kiểm tra thông tin.');
    }

    // Cập nhật role trên server
    await postToServer(`/users/${id}`, { role: 'admin' }, 'PATCH');

    // Sync localStorage
    await authService.syncUsersFromServer();

    const current = authService.getCurrentUser();
    if (current && current.id === id) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...userFromServer, role: 'admin' }));
      notifyUserChanged({ ...userFromServer, role: 'admin' });
    }
    return { ...userFromServer, role: 'admin' };
  },

  ensureDemoUser: () => {
    const users = readUsers();
    if (!users.some(u => u.email === 'demo@demo.com')) {
      users.push({
        id: '1',
        name: 'Người Dùng Demo',
        email: 'demo@demo.com',
        phone: '0989000000',
        gender: 'male',
        extra: 'Tài khoản demo',
        role: 'customer',
        password: 'demo123',
      } as User);
      writeUsers(users);
    }
  },

  // optional helper: seed users from server into localStorage (non-blocking)
  syncUsersFromServer: async () => {
    try {
      const res = await fetch(`${API}/users`);
      if (!res.ok) throw new Error('Không tải users từ server');
      const u = await res.json();
      if (Array.isArray(u) && u.length) {
        writeUsers(u as User[]);
      }
    } catch (e) {
      console.warn('syncUsersFromServer failed', e);
    }
  },
};

// named shortcuts for convenience imports
export const getCurrentUser = authService.getCurrentUser;
export const logout = authService.logout;