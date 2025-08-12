// components/RestaurantCard.tsx
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link 
      to={`/restaurants/${restaurant.id}`}  // Sửa thành /restaurants/ để khớp route
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
      <img
        src={restaurant.image || "/images/restaurant-default.jpg"}
        alt={restaurant.name}
        className="card-img-top"
        style={{ height: '150px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
      />
      <div className="card-body">
        <h5 className="card-title">{restaurant.name}</h5>
        <p className="card-text text-muted small mb-1">{restaurant.address}</p>
        <span className="badge bg-secondary">{restaurant.type}</span>
      </div>
    </Link>
  );
};

export default RestaurantCard;