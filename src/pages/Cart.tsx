// src/pages/Cart.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, ListGroup, Button, Alert, Spinner } from 'react-bootstrap';
import { getCartItems, removeFromCart, updateQuantity } from '../services/cartService';
import OrderSuccessPopup from '../components/OrderSuccessPopup';
import axios from 'axios';
import { authService } from '../services/authService';

type CartItem = { id: string; name: string; price: number; quantity: number; image: string; restaurantId: string | string[]; };
type Promotion = { id: string; title: string; description: string; };

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = getCartItems();
        setCartItems(items);

        const promoRes = await axios.get<Promotion[]>('http://localhost:3000/promotions').catch(() => ({ data: [] }));
        setPromotions(promoRes.data || []);
        if (promoRes.data && promoRes.data.length > 0) setAppliedPromo(promoRes.data[0]);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu giỏ hàng hoặc khuyến mãi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const handleStorageChange = () => setCartItems(getCartItems());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setCartItems(getCartItems());
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return;
    updateQuantity(id, newQty);
    setCartItems(getCartItems());
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedPromo ? subtotal * 0.3 : 0;
  const total = subtotal - discount;

  const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!authService.isAuthenticated()) {
      // không đăng nhập -> chuyển tới trang login
      return navigate('/login');
    }

    if (cartItems.length === 0) {
      setCheckoutError('Giỏ hàng trống. Vui lòng thêm món ăn.');
      return;
    }

    // Lưu danh sách món đã đặt và mở popup ngay
    setOrderedItems([...cartItems]);
    setShowSuccessPopup(true);

    try {
      await axios.post('http://localhost:3000/orders', {
        id: Date.now().toString(),
        userId: authService.getCurrentUser()?.id || 0,
        items: cartItems,
        total,
        createdAt: new Date().toISOString(),
      });
      localStorage.removeItem('cart');
      setCartItems([]);
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('⚠ Không thể gửi đơn hàng lên server. Đơn của bạn được tạo cục bộ.');
    }
  };

  return (
    <Container className="py-5">
      <h1 className="display-5 fw-bold mb-4 text-success">Giỏ hàng</h1>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
          <p>Đang tải...</p>
        </div>
      ) : (
        <>
          {error && <Alert variant="danger">{error}</Alert>}

          {cartItems.length === 0 ? (
            <div className="text-center text-muted">
              <i className="bi bi-cart-x fs-1 mb-3" />
              <p>Giỏ hàng của bạn đang trống.</p>
              <Link to="/menu" className="btn btn-success">Khám phá món ăn</Link>
            </div>
          ) : (
            <>
              <ListGroup className="mb-4">
                {cartItems.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex align-items-center">
                    <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }} />
                    <div className="flex-grow-1">
                      <h5>{item.name}</h5>
                      <p className="text-success mb-0">{item.price.toLocaleString()}đ x {item.quantity}</p>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="input-group input-group-sm w-25 me-3">
                        <Button variant="outline-secondary" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</Button>
                        <input type="text" className="form-control text-center" value={item.quantity} readOnly />
                        <Button variant="outline-secondary" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</Button>
                      </div>
                      <Button variant="outline-danger" onClick={() => handleRemove(item.id)}>Xóa</Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {appliedPromo && <Alert variant="success"><i className="bi bi-tag-fill" /> <strong>{appliedPromo.title}</strong> - {appliedPromo.description}</Alert>}

              <ListGroup className="mb-4">
                <ListGroup.Item className="d-flex justify-content-between"><span>Tạm tính:</span><strong>{subtotal.toLocaleString()}đ</strong></ListGroup.Item>
                {appliedPromo && <ListGroup.Item className="d-flex justify-content-between text-success"><span>Giảm giá ({appliedPromo.title}):</span><strong>-{discount.toLocaleString()}đ</strong></ListGroup.Item>}
                <ListGroup.Item className="d-flex justify-content-between"><span><strong>Tổng cộng:</strong></span><strong className="text-success fs-5">{total.toLocaleString()}đ</strong></ListGroup.Item>
              </ListGroup>

              <div className="d-flex justify-content-between">
                <Link to="/menu" className="btn btn-outline-success"><i className="bi bi-arrow-left" /> Tiếp tục mua sắm</Link>
                <Button className="btn btn-success btn-lg" onClick={handleCheckout}><i className="bi bi-credit-card" /> Mua ngay ({cartItems.length} món)</Button>
              </div>
            </>
          )}
        </>
      )}

      <OrderSuccessPopup show={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} cartItems={orderedItems} />

      {checkoutError && <div className="mt-3"><Alert variant="warning">{checkoutError}</Alert></div>}
    </Container>
  );
};

export default Cart;
