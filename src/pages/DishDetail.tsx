// src/pages/DishDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Cập nhật kiểu dữ liệu ID thành string
type Dish = {
  id: string; // <-- string
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  restaurantId: string | string[]; // <-- string hoặc mảng string
  rating?: number;
  available: boolean;
};

type Restaurant = {
  id: string; // <-- string
  name: string;
  description: string;
  address: string;
  type: string;
  image: string;
};

type Comment = {
  id: string; // <-- string (db.json có thể tự sinh string)
  userId: number; // <-- number (theo db.json hiện tại)
  userName: string;
  dishId: string; // <-- string
  rating: number;
  comment: string;
  createdAt: string;
};

const DishDetail = () => {
  // useParams trả về string hoặc undefined
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID món ăn không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lấy thông tin món
        const dishRes = await axios.get<Dish>(`http://localhost:3000/dishes/${id}`);
        setDish(dishRes.data);

        // 2. Lấy thông tin quán (hỗ trợ nhiều restaurantId)
        let restaurantData: Restaurant | null = null;
        if (Array.isArray(dishRes.data.restaurantId)) {
          // Nếu là mảng, lấy thông tin quán đầu tiên (hoặc có thể lấy tất cả nếu muốn)
          if (dishRes.data.restaurantId.length > 0) {
            const res = await axios.get<Restaurant>(`http://localhost:3000/restaurants/${dishRes.data.restaurantId[0]}`);
            restaurantData = res.data;
          }
        } else {
          // Nếu là chuỗi, lấy như cũ
          const res = await axios.get<Restaurant>(`http://localhost:3000/restaurants/${dishRes.data.restaurantId}`);
          restaurantData = res.data;
        }
        setRestaurant(restaurantData);

        // 3. Lấy bình luận
        const commentsRes = await axios.get<Comment[]>(`http://localhost:3000/reviews?dishId=${id}`);
        setComments(commentsRes.data);

        setLoading(false);
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu:', err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 404) {
              setError('Món ăn không tồn tại hoặc đã bị xóa.');
            } else {
              setError(`Lỗi từ server: ${err.response.status} - ${err.response.statusText}`);
            }
          } else if (err.request) {
            setError('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.');
          } else {
            setError(`Lỗi yêu cầu: ${err.message}`);
          }
        } else {
          setError('Có lỗi không xác định xảy ra.');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!dish) return;
    
    const cartItem = {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: quantity,
      image: dish.image,
      restaurantId: dish.restaurantId // string hoặc mảng string
    };
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex((item: any) => item.id === dish.id);
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`✅ Đã thêm ${quantity}x ${dish.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // navigate('/cart'); // Bỏ comment khi có trang /cart
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !dish) return;

    try {
      const newComment: Omit<Comment, 'id'> = { // Không gửi 'id', để server tự sinh
        userId: 1, // Trong đồ án, dùng user 1 làm ví dụ
        userName: "Bạn",
        dishId: dish.id, // string
        rating: 5,
        comment: commentText,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Gửi lên API
      const response = await axios.post<Comment>('http://localhost:3000/reviews', newComment);
      
      // Cập nhật giao diện với comment mới (bao gồm id từ server)
      setComments([response.data, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error("Lỗi khi gửi bình luận:", err);
      alert('Không thể gửi bình luận. Vui lòng thử lại!');
    }
  };

  const renderStars = (rating?: number) => {
    if (rating === undefined) return <span className="text-muted">Chưa có đánh giá</span>;
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
        <span className="ms-2">{rating.toFixed(1)}</span>
      </>
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2">Đang tải thông tin món ăn...</p>
      </div>
    );
  }

  if (error) { // Chỉ cần kiểm tra error
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-success" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  // Kiểm tra dish có tồn tại sau khi loading và không có error
  if (!dish) {
     return (
      <div className="container my-5">
        <div className="alert alert-danger">Không tìm thấy thông tin món ăn.</div>
        <button className="btn btn-success" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Ảnh to và thông tin món */}
      <div className="row g-5 align-items-start">
        {/* Ảnh món ăn */}
        <div className="col-12 col-lg-6">
          <div className="position-relative overflow-hidden rounded-4 shadow-lg" style={{ height: '450px' }}>
            {/* Ảnh từ db.json sẽ hiển thị ở đây */}
            <img
              src={dish.image} 
              alt={dish.name}
              className="w-100 h-100 object-fit-cover"
              style={{
                transform: 'scale(1)',
                transition: 'transform 0.3s ease'
              }}
              onError={(e) => {
                 // Xử lý ảnh lỗi nếu cần, ví dụ thay bằng ảnh mặc định
                 e.currentTarget.src = '/images/dish-default.jpg'; // Cần có ảnh mặc định trong public
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>

        {/* Thông tin món */}
        <div className="col-12 col-lg-6">
          <h1 className="fw-bold text-success">{dish.name}</h1>
          
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-success fs-4 px-4 py-3">{dish.price.toLocaleString()}đ</span>
            <span className="ms-3 text-muted fs-5">· {dish.category}</span>
          </div>

          <p className="lead">{dish.description}</p>

          <div className="d-flex align-items-center mb-4">
            {renderStars(dish.rating)} 
            <span className="text-muted ms-2">({comments.length} đánh giá)</span>
          </div>

          {restaurant && (
            <div className="mb-4">
              <h5>Quán: <span className="text-success">{restaurant.name}</span></h5>
              <p className="text-muted">{restaurant.address}</p>
              <span className="badge bg-secondary">{restaurant.type}</span>
            </div>
          )}

          {/* Số lượng */}
          <div className="d-flex align-items-center mb-4">
            <label className="me-3 fw-bold">Số lượng:</label>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
            >
              −
            </button>
            <span className="mx-3 fs-5">{quantity}</span>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setQuantity(prev => prev + 1)}
            >
              +
            </button>
          </div>

          {/* Nút hành động */}
          <div className="d-grid gap-3">
            <button 
              className="btn btn-danger btn-lg d-flex align-items-center justify-content-center py-3"
              onClick={handleBuyNow}
            >
              🛒 <span className="ms-2">Mua ngay</span>
            </button>
            <button 
              className="btn btn-outline-success btn-lg text-success d-flex align-items-center justify-content-center py-3"
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
              ➕ <span className="ms-2">Thêm vào giỏ hàng</span>
            </button>
          </div>

          {/* Thông tin giao hàng */}
          <div className="mt-4 p-3 bg-light rounded">
            <p className="mb-1"><i className="bi bi-truck"></i> Giao hàng trong 30 phút</p>
            <p className="mb-0"><i className="bi bi-shield-check"></i> Đảm bảo an toàn thực phẩm</p>
          </div>
        </div>
      </div>

      {/* Phần bình luận */}
      <div className="mt-5 pt-4 border-top">
        <h4><i className="bi bi-chat-left-text text-primary me-2"></i> Bình luận ({comments.length})</h4>

        {/* Form bình luận */}
        <form onSubmit={handleSubmitComment} className="my-3">
          <textarea
            className="form-control"
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="btn btn-primary mt-2">
            Gửi bình luận
          </button>
        </form>

        {/* Danh sách bình luận */}
        <div className="my-4">
          {comments.length === 0 ? (
            <div className="text-center text-muted py-3">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </div>
          ) : (
            comments.map((cmt) => (
              <div key={cmt.id} className="card mb-3 shadow-sm"> 
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{cmt.userName}</strong>
                      <span className="text-muted ms-2">{new Date(cmt.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      {renderStars(cmt.rating)}
                    </div>
                  </div>
                  <p className="mt-2 mb-0">{cmt.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DishDetail;
