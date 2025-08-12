// src/pages/RestaurantDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom'; // useParams để lấy id từ URL
import axios from 'axios';
import DishCard from '../components/DishCard'; // Giả định bạn đã có component này

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

// Định nghĩa interface cho dữ liệu món ăn
interface Dish {
  id: string;
  name: string;
  price: number;
  category: string;
  type: string;
  isVegetarian: boolean;
  description: string;
  restaurantId: string | string[]; // ID của nhà hàng sở hữu món ăn
  available: boolean;
  image: string;
  rating: number;
}

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID nhà hàng từ URL
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
         setError("ID nhà hàng không hợp lệ.");
         setLoading(false);
         return;
      }
      try {
        setLoading(true);
        // Gọi API hoặc lấy dữ liệu từ db.json để lấy thông tin nhà hàng
        // const restaurantResponse = await axios.get<Restaurant>(`/api/restaurants/${id}`);
        const restaurantResponse = await axios.get<Restaurant>(`http://localhost:3000/restaurants/${id}`);
        setRestaurant(restaurantResponse.data);

        // Lấy toàn bộ món ăn rồi lọc theo restaurantId (mảng hoặc chuỗi)
        const dishesResponse = await axios.get<Dish[]>(`http://localhost:3000/dishes`);
        const filteredDishes = dishesResponse.data.filter((dish) => {
          if (Array.isArray(dish.restaurantId)) {
            return dish.restaurantId.includes(id);
          }
          return dish.restaurantId === id;
        });
        setDishes(filteredDishes);

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu nhà hàng hoặc món ăn:", err);
        setError("Không thể tải thông tin nhà hàng hoặc món ăn.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/restaurants" className="btn btn-secondary">Quay lại danh sách</Link>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container className="py-5 text-center">
        <p>Không tìm thấy nhà hàng.</p>
        <Link to="/restaurants" className="btn btn-secondary">Quay lại danh sách</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Thông tin chi tiết nhà hàng */}
      <Card className="mb-4 shadow">
        <Card.Img variant="top" src={restaurant.image} alt={restaurant.name} style={{ height: '300px', objectFit: 'cover' }} />
        <Card.Body>
          <Card.Title className="display-6">{restaurant.name}</Card.Title>
          <Card.Text><strong>Loại:</strong> {restaurant.type}</Card.Text>
          <Card.Text><strong>Địa chỉ:</strong> {restaurant.address}</Card.Text>
          <Card.Text><strong>Mô tả:</strong> {restaurant.description}</Card.Text>
        </Card.Body>
      </Card>

      {/* Danh sách món ăn */}
      <h2 className="mb-4">Thực Đơn</h2>
      {dishes.length === 0 ? (
        <p>Nhà hàng này chưa có món ăn nào.</p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {dishes.map((dish) => (
            <Col key={dish.id}>
              <DishCard dish={dish} /> {/* Giả định DishCard nhận prop dish */}
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default RestaurantDetailPage;
