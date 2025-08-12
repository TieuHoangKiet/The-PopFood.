import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DishCard from '../components/DishCard';
import { Link } from 'react-router-dom';

interface Dish {
  id: string | number; // Cập nhật để phù hợp với cả số và chuỗi
  name: string;
  category: string;
  type: string;
  price: number;
  image: string;
  available?: boolean;
  restaurantId?: string | string[]; // Thêm nếu DishCard cần
  // region?: string; // Nếu có trường region trong dữ liệu, có thể thêm
}

interface Promotion {
  id: string | number; // Cập nhật để phù hợp
  title: string;
  description: string;
}

const Menu: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  const [region, setRegion] = useState(''); // Filter theo category (miền/loại)
  const [maxPrice, setMaxPrice] = useState('');
  const [type, setType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesRes, promoRes] = await Promise.all([
          axios.get<Dish[]>('http://localhost:3000/dishes'),
          axios.get<Promotion[]>('http://localhost:3000/promotions')
        ]);

        // ✅ Chỉ lấy món available = true
        const availableDishes = dishesRes.data.filter(dish => dish.available === true);

        setDishes(availableDishes);
        setFilteredDishes(availableDishes);
        setPromotions(promoRes.data);
      } catch (err) {
        console.error('Không thể tải dữ liệu', err);
        setDishes([]);
        setFilteredDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplyFilters = () => {
    let result = [...dishes];

    // --- Sửa lỗi filter region/category ---
    // Giờ đây, 'region' filter thực chất là filter theo 'category'
    if (region) {
      // --- Sửa: So sánh không phân biệt chữ hoa/thường ---
      result = result.filter(d => d.category.toLowerCase() === region.toLowerCase());
    }

    if (maxPrice) {
      const priceNum = parseInt(maxPrice, 10);
      if (!isNaN(priceNum)) {
        result = result.filter(d => d.price <= priceNum);
      }
    }

    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'ăn vặt') {
        // --- Sửa: So sánh không phân biệt chữ hoa/thường ---
        result = result.filter(d => d.category.toLowerCase().includes('ăn vặt') || d.category.toLowerCase().includes('đồ ăn vặt'));
      } else if (lowerType === 'nước uống') {
        // --- Sửa: So sánh không phân biệt chữ hoa/thường ---
        result = result.filter(d => d.category.toLowerCase().includes('nước uống') || d.type === 'nước');
      } else if (lowerType === 'cơm') {
        result = result.filter(d => d.name.toLowerCase().includes('cơm'));
      } else if (lowerType === 'nước lọc') {
        result = result.filter(d => d.name.toLowerCase().includes('nước lọc'));
      } else {
        // --- Sửa: So sánh không phân biệt chữ hoa/thường cho type ---
        result = result.filter(d => d.type.toLowerCase() === lowerType);
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(term));
    }

    setFilteredDishes(result);
  };

  const handleClearFilters = () => {
    setRegion('');
    setMaxPrice('');
    setType('');
    setSearchTerm('');
    setFilteredDishes(dishes);
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // --- Hàm hỗ trợ để lấy danh sách category duy nhất từ filteredDishes ---
  const getUniqueCategories = (dishes: Dish[]): string[] => {
    const categories = dishes.map(d => d.category);
    return Array.from(new Set(categories)).filter(cat => cat); // Loại bỏ category rỗng
  };

  // --- Hàm hỗ trợ để phân loại món ăn theo category ---
  const groupDishesByCategory = (dishes: Dish[]): { [key: string]: Dish[] } => {
    const groups: { [key: string]: Dish[] } = {};
    const validCategories = ['bắc', 'trung', 'nam', 'đồ ăn vặt', 'nước uống']; // Chuyển sang chữ thường để so sánh

    dishes.forEach(dish => {
      const dishCategoryLower = dish.category.toLowerCase();
      let groupKey = dishCategoryLower;

      // Gom nhóm các category vào các nhóm chính nếu có thể
      if (dishCategoryLower.includes('nước uống')) {
        groupKey = 'nước uống';
      } else if (dishCategoryLower.includes('ăn vặt') || dishCategoryLower.includes('đồ ăn vặt')) {
        groupKey = 'đồ ăn vặt';
      } else if (dishCategoryLower.includes('bắc')) {
        groupKey = 'bắc';
      } else if (dishCategoryLower.includes('trung')) {
        groupKey = 'trung';
      } else if (dishCategoryLower.includes('nam')) {
        groupKey = 'nam';
      }
      // Nếu không thuộc nhóm nào, vẫn giữ category gốc

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(dish);
    });

    // Sắp xếp lại thứ tự các nhóm chính
    const orderedGroups: { [key: string]: Dish[] } = {};
    const order = ['bắc', 'trung', 'nam', 'đồ ăn vặt', 'nước uống'];
    order.forEach(key => {
        if (groups[key]) {
            orderedGroups[key] = groups[key];
        }
    });
    // Thêm các nhóm khác (nếu có)
    Object.keys(groups).forEach(key => {
        if (!order.includes(key)) {
             orderedGroups[key] = groups[key];
        }
    });

    return orderedGroups;
  };

  const groupedDishes = groupDishesByCategory(filteredDishes);

  return (
    <div className="container my-5">
      {/* Khuyến mãi */}
      {promotions.length > 0 && (
        <div className="alert alert-danger text-center mb-4" role="alert">
          <strong>🎉 {promotions[0].title}</strong> – {promotions[0].description}
        </div>
      )}

      <h2 className="text-center mb-4">🍽️ Thực đơn The PopFood</h2>

      {/* Bộ lọc */}
      <div className="row g-3 mb-4">
        {/* Tìm kiếm */}
        <div className="col-12">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Miền & Giá */}
        <div className="col-md-6">
          <select
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">Chọn miền</option>
            <option value="Bắc">Miền Bắc</option>
            <option value="Trung">Miền Trung</option>
            <option value="Nam">Miền Nam</option>
          </select>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">≤</span>
            <input
              type="number"
              className="form-control"
              placeholder="Giá tối đa"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <span className="input-group-text">đ</span>
          </div>
        </div>

        {/* Loại */}
        <div className="col-12">
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Chọn loại</option>
            <option value="mặn">Đồ mặn</option>
            <option value="chay">Đồ chay</option>
            <option value="ăn vặt">Ăn vặt</option>
            <option value="nước uống">Nước uống</option>
            <option value="cơm">Cơm</option>
            <option value="nước lọc">Nước lọc</option>
          </select>
        </div>

        {/* Nút */}
        <div className="col-12 d-flex gap-2 justify-content-center">
          <button className="btn btn-success px-4" onClick={handleApplyFilters}>
            <i className="bi bi-funnel"></i> Lọc
          </button>
          <button className="btn btn-outline-secondary px-4" onClick={handleClearFilters}>
            <i className="bi bi-x-circle"></i> Bỏ lọc
          </button>
        </div>
      </div>

      {/* Số lượng kết quả */}
      <div className="text-muted mb-3">
        Tìm thấy <strong>{filteredDishes.length}</strong> món ăn phù hợp
      </div>

      {/* Danh sách - ĐÃ SỬA */}
      <div className="row g-4">
        {/* Duyệt qua các nhóm đã được phân loại */}
        {Object.entries(groupedDishes).length > 0 ? (
          Object.entries(groupedDishes).map(([categoryKey, dishesInCategory]) => {
            // Nếu nhóm rỗng, bỏ qua
            if (dishesInCategory.length === 0) return null;

            // Định dạng tiêu đề nhóm
            let displayTitle = categoryKey;
            if (categoryKey === 'đồ ăn vặt') {
              displayTitle = '🍟 Ăn vặt';
            } else if (categoryKey === 'nước uống') {
              displayTitle = '🥤 Nước uống';
            } else if (['bắc', 'trung', 'nam'].includes(categoryKey)) {
              displayTitle = `🇻🇳 Miền ${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}`;
            } else {
              // Cho các category khác không nằm trong 5 nhóm chính
              displayTitle = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
            }

            return (
              <div className="col-12 mt-5" key={categoryKey}>
                <h4 className="text-success border-bottom pb-2">{displayTitle}</h4>
                <div className="row g-3">
                  {dishesInCategory.map(dish => (
                    <div className="col-12 col-md-6 col-lg-4" key={dish.id}>
                      <Link to={`/dish/${dish.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <DishCard dish={dish} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Trường hợp không có món nào sau khi lọc
          <div className="text-center text-muted my-5">
            <i className="bi bi-emoji-frown"></i> Không tìm thấy món ăn nào phù hợp
          </div>
        )}
      </div>

      {/* Thông báo nếu filteredDishes rỗng (đã được xử lý ở trên) */}
      {/* {filteredDishes.length === 0 && (
        <div className="text-center text-muted my-5">
          <i className="bi bi-emoji-frown"></i> Không tìm thấy món ăn nào phù hợp
        </div>
      )} */}
    </div>
  );
};

export default Menu;