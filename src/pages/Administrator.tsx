import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/administratorService';
import { getCurrentUser } from '../services/authService';

const Administrator: React.FC = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // add dish modal
  const [showAddDish, setShowAddDish] = useState(false);
  // --- Đảm bảo category được chọn từ danh sách hợp lệ ---
  const [newDish, setNewDish] = useState<any>({
    name: '',
    price: 0,
    category: '', // <-- Sẽ là dropdown
    type: '', // Có thể nhập tay hoặc cũng làm dropdown
    description: '',
    image: '',
    available: true,
    region: '', // Có thể xem xét nếu cần, nhưng category thường đủ
    restaurantIds: [] as string[] // <-- Luôn là mảng
  });

  // --- Thêm state cho nhà hàng mới ---
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: '',
    address: '',
    type: 'Quán ăn', // Giá trị mặc định
    image: '',
    // ownerId có thể được set mặc định hoặc chọn, ở đây để đơn giản có thể bỏ qua hoặc set mặc định
  });

  // add promotion
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || String(u.role).toLowerCase() !== 'admin') {
      navigate('/login');
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, r, p] = await Promise.all([
        adminService.getDishes(),
        adminService.getRestaurants(),
        adminService.getPromotions()
      ]);
      setDishes(Array.isArray(d) ? d : []);
      setRestaurants(Array.isArray(r) ? r : []);
      setPromotions(Array.isArray(p) ? p : []);
      setErr(null);
    } catch (e: any) {
      setErr(e.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!window.confirm('Xác nhận xóa món?')) return;
    try {
      await adminService.deleteDish(id);
      setDishes(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      alert('Xóa thất bại: ' + (e.message || e));
    }
  };

  const handleToggle = async (dish: any) => {
    try {
      const updatedDish = await adminService.toggleDishAvailability(dish.id, !dish.available);
      setDishes(prev =>
        prev.map(d => d.id === dish.id ? updatedDish : d)
      );
    } catch (e: any) {
      alert('Thao tác thất bại: ' + (e.message || e));
    }
  };

  const handleAddDish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDish.category) {
        alert('Vui lòng chọn danh mục.');
        return;
    }
    if (newDish.restaurantIds.length === 0) {
         alert('Vui lòng chọn ít nhất một nhà hàng.');
         return;
    }
    try {
      // --- Đảm bảo payload gửi đi có category hợp lệ và restaurantId là mảng ---
      const payload = {
        ...newDish,
        price: Number(newDish.price),
        restaurantId: newDish.restaurantIds, // Gửi mảng
        // region có thể giữ nguyên hoặc bỏ nếu không cần
      };
      const added = await adminService.addDish(payload);
      setDishes(prev => [added, ...prev]);
      setShowAddDish(false);
      // Reset form
      setNewDish({
        name: '',
        price: 0,
        category: '',
        type: '',
        description: '',
        image: '',
        available: true,
        region: '',
        restaurantIds: []
      });
    } catch (err: any) {
      alert('Thêm thất bại: ' + (err.message || err));
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm('Xác nhận xóa nhà hàng?')) return;
    try {
      await adminService.deleteRestaurant(id);
      setRestaurants(prev => prev.filter(r => r.id !== id));
      // Cập nhật danh sách dishes nếu cần (ví dụ: xóa restaurantId khỏi dishes)
      // Ở đây, db.json sẽ tự động cập nhật nếu có ràng buộc, nhưng frontend nên load lại để chắc chắn
      // loadAll(); // Có thể gọi lại nếu cần cập nhật liên kết
    } catch (e: any) {
      alert('Xóa thất bại: ' + (e.message || e));
    }
  };

  // --- Hàm xử lý thêm nhà hàng ---
  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newRestaurant,
        // ownerId: 1, // Có thể set mặc định hoặc thêm input chọn ownerId
      };
      const added = await adminService.addRestaurant(payload);
      setRestaurants(prev => [added, ...prev]);
      setShowAddRestaurant(false);
      // Reset form
      setNewRestaurant({
        name: '',
        description: '',
        address: '',
        type: 'Quán ăn', // Reset về mặc định
        image: '',
      });
    } catch (err: any) {
      alert('Thêm nhà hàng thất bại: ' + (err.message || err));
    }
  };

  const handleAddPromotion = async () => {
    if (!promoTitle.trim()) return alert('Nhập tiêu đề');
    try {
      const added = await adminService.addPromotion({ title: promoTitle.trim(), description: promoDesc.trim() });
      setPromotions(prev => [added, ...prev]);
      setPromoTitle('');
      setPromoDesc('');
    } catch (e: any) {
      alert('Thêm khuyến mãi thất bại: ' + (e.message || e));
    }
  };

  // --- Hàm hỗ trợ để xử lý thay đổi multi-select nhà hàng ---
  const handleRestaurantIdsChange = (selectedOptions: any) => {
    const selectedValues = Array.from(selectedOptions)
      .map((option: any) => option.value);
    setNewDish((prev: any) => ({ ...prev, restaurantIds: selectedValues }));
  };

  if (loading) return <Container className="py-5"><Spinner animation="border" /></Container>;
  return (
    <Container className="py-4">
      <h2 className="mb-4">Trang Administrator</h2>
      {err && <Alert variant="danger">{err}</Alert>}

      <Row className="mb-4">
        <Col md={8}>
          {/* Món ăn */}
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Món ăn</strong>
              <div>
                <Button size="sm" variant="success" onClick={() => setShowAddDish(true)}>
                  <i className="bi bi-plus-lg me-1" />Thêm món
                </Button>
                <Button size="sm" variant="secondary" className="ms-2" onClick={loadAll}>
                  <i className="bi bi-arrow-clockwise" />
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-2">
              <Table responsive bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Giá</th>
                    <th>Danh mục</th> {/* Thay 'Miền' bằng 'Danh mục' cho chính xác hơn */}
                    <th>Nhà hàng</th>
                    <th>Available</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {dishes.map(d => (
                    <tr key={d.id}>
                      <td style={{ width: 120 }}>
                        <img src={d.image} alt={d.name} style={{ width: 80, height: 50, objectFit: 'cover' }} />
                      </td>
                      <td>{d.name}</td>
                      <td>{Number(d.price).toLocaleString()} đ</td>
                      {/* Hiển thị category thay vì region nếu cần thiết hơn */}
                      <td>{d.category}</td>
                      <td>
                        {Array.isArray(d.restaurantId)
                          ? d.restaurantId.map((rid: string) => restaurants.find(r => r.id === rid)?.name).filter(Boolean).join(', ')
                          : restaurants.find(r => r.id === d.restaurantId)?.name}
                      </td>
                      <td>{d.available ? <span className="badge bg-success">Hiện</span> : <span className="badge bg-secondary">Ẩn</span>}</td>
                      <td style={{ width: 200 }}>
                        <Button
                          size="sm"
                          variant={d.available ? 'outline-secondary' : 'outline-success'}
                          onClick={() => handleToggle(d)}
                        >
                          {d.available ? <><i className="bi bi-eye-slash me-1" />Ẩn</> : <><i className="bi bi-eye me-1" />Hiện</>}
                        </Button>{' '}
                        <Button size="sm" variant="danger" onClick={() => handleDeleteDish(d.id)}>
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Nhà hàng */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Nhà hàng</strong>
              <div>
                 {/* --- Nút Thêm Nhà hàng --- */}
                <Button size="sm" variant="success" onClick={() => setShowAddRestaurant(true)}>
                  <i className="bi bi-plus-lg me-1" />Thêm nhà hàng
                </Button>
                <Button size="sm" variant="secondary" className="ms-2" onClick={loadAll}>
                  <i className="bi bi-arrow-clockwise" />
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-2">
              <Table responsive bordered hover className="mb-0">
                <thead>
                  <tr><th>Ảnh</th><th>Tên</th><th>Địa chỉ</th><th>Loại</th><th>Hành động</th></tr>
                </thead>
                <tbody>
                  {restaurants.map(r => (
                    <tr key={r.id}>
                      <td style={{ width: 120 }}>
                        <img src={r.image} alt={r.name} style={{ width: 80, height: 50, objectFit: 'cover' }} />
                      </td>
                      <td>{r.name}</td>
                      <td>{r.address}</td>
                      <td>{r.type}</td>
                      <td style={{ width: 150 }}>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteRestaurant(r.id)}>
                          <i className="bi bi-trash" /> Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Khuyến mãi */}
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header><strong>Khuyến mãi</strong></Card.Header>
            <Card.Body>
              <Form.Group className="mb-2">
                <Form.Control placeholder="Tiêu đề" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control placeholder="Mô tả" value={promoDesc} onChange={e => setPromoDesc(e.target.value)} />
              </Form.Group>
              <div className="d-grid">
                <Button onClick={handleAddPromotion} variant="primary">Thêm khuyến mãi</Button>
              </div>

              <hr />
              <div>
                {promotions.length === 0 ? <div>Không có khuyến mãi</div> :
                  promotions.map(p => (
                    <Card key={p.id} className="mb-2">
                      <Card.Body className="p-2 d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{p.title}</strong>
                          <div style={{ fontSize: 13 }}>{p.description}</div>
                        </div>
                        <div>
                          <Button size="sm" variant="danger" onClick={async () => {
                            if (!window.confirm('Xóa khuyến mãi?')) return;
                            try {
                              await adminService.deletePromotion(p.id);
                              setPromotions(prev => prev.filter(x => x.id !== p.id));
                            } catch (e: any) { alert('Lỗi: ' + (e.message || e)); }
                          }}><i className="bi bi-trash" /></Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                }
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Dish Modal */}
      <Modal show={showAddDish} onHide={() => setShowAddDish(false)} centered size="lg">
        <Form onSubmit={handleAddDish}>
          <Modal.Header closeButton><Modal.Title>Thêm món mới</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-2">
                  <Form.Label>Tên món</Form.Label>
                  <Form.Control value={newDish.name} onChange={e => setNewDish(prev => ({ ...prev, name: e.target.value }))} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Giá</Form.Label>
                  <Form.Control type="number" value={newDish.price} onChange={e => setNewDish(prev => ({ ...prev, price: e.target.value }))} required />
                </Form.Group>
                {/* --- Sửa: Dropdown cho Category --- */}
                <Form.Group className="mb-2">
                  <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={newDish.category}
                    onChange={e => setNewDish(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    <option value="Bắc">Miền Bắc</option>
                    <option value="Trung">Miền Trung</option>
                    <option value="Nam">Miền Nam</option>
                    <option value="Đồ ăn vặt">Đồ ăn vặt</option>
                    <option value="Nước uống">Nước uống</option>
                     {/* Có thể thêm các category khác nếu cần */}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Loại</Form.Label>
                  <Form.Control value={newDish.type} onChange={e => setNewDish(prev => ({ ...prev, type: e.target.value }))} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control as="textarea" rows={3} value={newDish.description} onChange={e => setNewDish(prev => ({ ...prev, description: e.target.value }))} />
                </Form.Group>
                {/* --- Region có thể giữ lại nếu cần phân loại thêm --- */}
                <Form.Group className="mb-2">
                  <Form.Label>Miền (nếu cần)</Form.Label>
                  <Form.Select value={newDish.region} onChange={e => setNewDish(prev => ({ ...prev, region: e.target.value }))}>
                    <option value="">-- Không chọn --</option>
                    <option value="Bắc">Miền Bắc</option>
                    <option value="Trung">Miền Trung</option>
                    <option value="Nam">Miền Nam</option>
                  </Form.Select>
                </Form.Group>
                {/* --- Multi-select cho Nhà hàng --- */}
                <Form.Group className="mb-2">
                  <Form.Label>Nhà hàng <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    multiple
                    value={newDish.restaurantIds}
                    onChange={(e) => handleRestaurantIdsChange(e.target.selectedOptions)}
                    required
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Giữ Ctrl (Cmd trên Mac) để chọn nhiều nhà hàng.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Ảnh (URL)</Form.Label>
                  <Form.Control value={newDish.image} onChange={e => setNewDish(prev => ({ ...prev, image: e.target.value }))} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Available</Form.Label>
                  <Form.Check
                    type="checkbox"
                    checked={!!newDish.available}
                    onChange={e => setNewDish(prev => ({ ...prev, available: e.target.checked }))}
                    label="Hiển thị"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddDish(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Thêm</Button>
          </Modal.Footer>
        </Form>
      </Modal>

       {/* --- Add Restaurant Modal --- */}
      <Modal show={showAddRestaurant} onHide={() => setShowAddRestaurant(false)} centered>
        <Form onSubmit={handleAddRestaurant}>
          <Modal.Header closeButton>
            <Modal.Title>Thêm nhà hàng mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên nhà hàng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newRestaurant.description}
                onChange={(e) => setNewRestaurant({...newRestaurant, description: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={newRestaurant.address}
                onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại</Form.Label>
              <Form.Select
                value={newRestaurant.type}
                onChange={(e) => setNewRestaurant({...newRestaurant, type: e.target.value})}
              >
                <option value="Quán ăn">Quán ăn</option>
                <option value="Nhà hàng">Nhà hàng</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh (URL)</Form.Label>
              <Form.Control
                type="text"
                value={newRestaurant.image}
                onChange={(e) => setNewRestaurant({...newRestaurant, image: e.target.value})}
              />
            </Form.Group>

            {/* ownerId có thể thêm nếu cần, ở đây để đơn giản */}
            {/* <Form.Group className="mb-3">
              <Form.Label>ID Chủ sở hữu</Form.Label>
              <Form.Control
                type="number"
                value={newRestaurant.ownerId || ''}
                onChange={(e) => setNewRestaurant({...newRestaurant, ownerId: Number(e.target.value) || 0})}
              />
            </Form.Group> */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddRestaurant(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Thêm Nhà hàng
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Administrator;