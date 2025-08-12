
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return text; }
}

// --- Kiểu dữ liệu cho Promotion ---
// Bạn có thể tạo một file types.ts riêng, nhưng để đơn giản, định nghĩa ở đây
export interface Promotion {
  id: string;
  title: string;
  description: string;
  // --- Thêm trường discountPercent ---
  discountPercent: number; // Giá trị phần trăm giảm giá, ví dụ: 15 cho 15%
}

export const adminService = {
  getDishes: () => request('/dishes'),
  getDish: (id: string) => request(`/dishes/${id}`),
  addDish: (dish: any) => request('/dishes', { method: 'POST', body: JSON.stringify(dish) }),
  updateDish: (id: string, patch: any) => request(`/dishes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteDish: (id: string) => fetch(`${BASE_URL}/dishes/${id}`, { method: 'DELETE' }).then(r => r.ok ? {} : r.json().then(t => Promise.reject(t))),

  getRestaurants: () => request('/restaurants'),
  addRestaurant: (r: any) => request('/restaurants', { method: 'POST', body: JSON.stringify(r) }),
  updateRestaurant: (id: string, patch: any) => request(`/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteRestaurant: (id: string) => fetch(`${BASE_URL}/restaurants/${id}`, { method: 'DELETE' }).then(r => r.ok ? {} : r.json().then(t => Promise.reject(t))),

  // --- Cập nhật các phương thức liên quan đến Promotions ---
  getPromotions: () => request('/promotions'),
  // --- addPromotion giờ nhận vào một đối tượng Promotion ---
  addPromotion: (p: Promotion) => request('/promotions', { method: 'POST', body: JSON.stringify(p) }),
  // --- deletePromotion giữ nguyên ---
  deletePromotion: (id: string) => fetch(`${BASE_URL}/promotions/${id}`, { method: 'DELETE' }).then(r => r.ok ? {} : r.json().then(t => Promise.reject(t))),

  toggleDishAvailability: (id: string, available: boolean) => request(`/dishes/${id}`, { method: 'PATCH', body: JSON.stringify({ available }) }),
};
