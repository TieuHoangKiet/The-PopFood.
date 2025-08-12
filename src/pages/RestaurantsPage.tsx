// src/pages/RestaurantsPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Định nghĩa interface cho dữ liệu nhà hàng
interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  type: string;
  ownerId: number;
  image: string;
}

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Giả định bạn có endpoint API để lấy danh sách nhà hàng
        // const response = await axios.get<Restaurant[]>('/api/restaurants');
        // setRestaurants(response.data);

        // Nếu dùng db.json trực tiếp (cho mục đích dev/mock)
        const response = await axios.get('http://localhost:3000/restaurants'); // Điều chỉnh URL nếu cần
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhà hàng:", err);
        setError("Không thể tải danh sách nhà hàng.");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>Đang tải danh sách nhà hàng...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="display-4 fw-bold mb-4 text-center text-success">Quán Ăn Nổi Bật</h1>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {restaurants.map((restaurant) => (
          <Col key={restaurant.id}>
            <Card className="h-100 shadow-lg border-0 restaurant-card" style={{ transition: 'transform 0.2s' }}>
              <div style={{ overflow: 'hidden', borderRadius: '1rem 1rem 0 0' }}>
                <Card.Img
                  variant="top"
                  src={restaurant.image}
                  alt={restaurant.name}
                  style={{ height: '220px', objectFit: 'cover', width: '100%', transition: 'transform 0.3s' }}
                  className="restaurant-img"
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold fs-5 text-success mb-2">{restaurant.name}</Card.Title>
                <Card.Text className="flex-grow-1 mb-2">
                  <span className="badge bg-success mb-2">{restaurant.type}</span><br />
                  <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                  <span className="fw-semibold">{restaurant.address}</span><br />
                  <span className="text-muted small">{restaurant.description}</span>
                </Card.Text>
                <Link to={`/restaurants/${restaurant.id}`} className="btn btn-outline-success mt-auto fw-bold">
                  <i className="bi bi-eye me-1"></i>Xem Chi Tiết
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <style>{`
        .restaurant-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .restaurant-img:hover {
          transform: scale(1.07);
        }
      `}</style>
    </Container>
  );
};

export default RestaurantsPage;
