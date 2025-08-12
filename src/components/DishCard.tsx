import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../services/cartService';

interface Dish {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  restaurantId: string | string[];
  rating?: number;
}

const DishCard = ({ dish }: { dish: Dish }) => {
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      image: dish.image,
      restaurantId: dish.restaurantId,
    });
    alert(`Đã thêm ${dish.name} vào giỏ hàng!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
    navigate('/cart');
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted">★★★★★</span>;
    
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
        ))}
        {hasHalf && <i className="bi bi-star-half text-warning"></i>}
        {Array(emptyStars).fill(0).map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
        ))}
      </>
    );
  };

  return (
    <Link 
      to={`/dish/${dish.id}`}
      className="card h-100 text-decoration-none border-light shadow-sm"
      style={{ 
        transform: 'scale(1)',
        transition: 'all 0.3s ease',
        borderRadius: '12px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <div className="position-relative">
        <img
          src={dish.image}
          alt={dish.name}
          className="card-img-top"
          style={{ 
            height: '180px', 
            objectFit: 'cover',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-primary">{dish.category}</span>
        </div>
      </div>
      <div className="card-body">
        <h6 className="card-title mb-1 text-dark">{dish.name}</h6>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text text-success fw-bold mb-1">{dish.price.toLocaleString()}đ</p>
          <div className="text-warning">
            {renderStars(dish.rating)}
          </div>
        </div>
        
        <div className="d-flex gap-2 mt-3">
          <button 
            className="btn btn-danger btn-sm flex-fill"
            onClick={handleBuyNow}
          >
            🛒 Mua ngay
          </button>
          <button 
            className="btn btn-outline-success btn-sm flex-fill text-success"
            style={{ transition: 'all 0.3s' }}
            onMouseEnter={(e) => {
              e.currentTarget.classList.remove('btn-outline-success');
              e.currentTarget.classList.add('btn-success', 'text-white');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('btn-success', 'text-white');
              e.currentTarget.classList.add('btn-outline-success', 'text-success');
            }}
            onClick={handleAddToCart}
          >
            ➕
          </button>
        </div>
      </div>
    </Link>
  );
};

export default DishCard;