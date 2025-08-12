// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DishDetail from './pages/DishDetail';
import Menu from './pages/Menu';
import Footer from './components/Footer';
import Header from './components/Header';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import RestaurantsPage from './pages/RestaurantsPage';
import Cart from './pages/Cart';
import Login from './pages/login';
import Register from './pages/Register';
import ThongTin from './pages/information';
import Administrator from './pages/Administrator';

// Thêm component NotFound đơn giản
const NotFound = () => (
  <div className="text-center my-5">
    <h2>404 - Trang không tồn tại</h2>
    <a href="/">Quay về trang chủ</a>
  </div>
);

const App = () => {
  return (
    <Router>
      <Header />
      <div className="min-vh-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/dish/:id" element={<DishDetail />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/information" element={<ThongTin />} />
          <Route path="/admin" element={<Administrator />} />
          <Route path="*" element={<NotFound />} />  {/* Thêm fallback route */}
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;