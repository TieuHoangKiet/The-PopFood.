// pages/RestaurantDetail.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type Dish = {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  [key: string]: any;
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (err) {
        console.error('Không thể tải thông tin quán');
      }
    };

    const fetchDishes = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/dishes?restaurantId=${id}`);
        setDishes(res.data);
      } catch (err) {
        console.error('Không thể tải danh sách món');
      }
    };

    Promise.all([fetchRestaurant(), fetchDishes()])
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center my-5">Đang tải...</div>;
  if (!restaurant) return <div className="text-center my-5">Không tìm thấy quán</div>;

  return (
    <div className="container my-5">
      {/* Ảnh quán */}
      <div className="row mb-5">
        <div className="col-12">
          <div 
            className="position-relative overflow-hidden rounded-4 shadow-lg"
            style={{ height: '300px' }}
          >
            <img
              src={restaurant.image || "/images/restaurant-default.jpg"}
              alt={restaurant.name}
              className="w-100 h-100 object-fit-cover"
              style={{ transform: 'scale(1)', transition: 'transform 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>
        <div className="col-12 mt-3 text-center">
          <h1 className="fw-bold text-success">{restaurant.name}</h1>
          <p className="text-muted">{restaurant.address}</p>
          <span className="badge bg-secondary">{restaurant.type}</span>
        </div>
      </div>

      {/* Danh sách món ăn */}
      <h3><i className="bi bi-menu-app"></i> Thực đơn</h3>
      <div className="row g-4 mt-3">
        {dishes.length > 0 ? (
          dishes.map(dish => (
            <div 
              className="col-12 col-md-6 col-lg-4" 
              key={dish.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/dishes/${dish.id}`)}
            >
              <DishCard dish={dish} />
            </div>
          ))
        ) : (
          <div className="text-center text-muted">Quán chưa có món nào</div>
        )}
      </div>
    </div>
  );
};

// Import DishCard ở đầu file
import DishCard from './DishCard';

export default RestaurantDetail;