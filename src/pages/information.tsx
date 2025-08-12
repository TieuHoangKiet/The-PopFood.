// src/pages/ThongTin.tsx
import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

const ThongTin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', gender: 'male', extra: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [showPromote, setShowPromote] = useState(false);
  const [confirm, setConfirm] = useState({ identifier: '', password: '' });
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
    if (u) setForm({ name: u.name || '', phone: u.phone || '', gender: (u.gender as any) || 'male', extra: u.extra || '' });
  }, []);

  const requireLogin = () => {
    if (!user) {
      setErr('Bạn cần đăng nhập để xem trang này.');
      return true;
    }
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErr(null); setMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireLogin()) return;
    if (!form.name.trim()) { setErr('Tên không được để trống'); return; }

    setLoading(true);
    try {
      const updated = await authService.updateProfile({ id: user!.id, name: form.name.trim(), phone: form.phone.trim(), gender: form.gender as any, extra: form.extra });
      setUser(updated);
      setMsg('Cập nhật thông tin thành công.');
    } catch (error: any) {
      setErr(error.message || 'Không cập nhật được.');
    } finally {
      setLoading(false);
    }
  };

  const openPromote = () => {
    if (requireLogin()) return;
    setPromoteError(null); setConfirm({ identifier: '', password: '' }); setShowPromote(true);
  };

  const handlePromote = async () => {
    if (!user) return;
    setPromoteError(null);
    if (!confirm.identifier.trim() || !confirm.password) { setPromoteError('Vui lòng nhập đủ thông tin xác thực'); return; }
    setPromoteLoading(true);
    try {
      const updated = await authService.promoteToAdmin(user.id, confirm.identifier.trim(), confirm.password);
      setUser(updated); setShowPromote(false); setMsg('Bạn đã được thăng chức thành admin.');
    } catch (err: any) {
      setPromoteError(err.message || 'Xác thực thất bại.');
    } finally {
      setPromoteLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">Bạn chưa đăng nhập. Vui lòng <a href="/login">đăng nhập</a> để xem thông tin.</div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Thông tin tài khoản</h2>
      {msg && <Alert variant="success">{msg}</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email (không thể thay đổi)</Form.Label>
          <Form.Control value={user.email} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Họ và tên</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control name="phone" value={form.phone} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Giới tính</Form.Label>
          <div>
            <Form.Check inline label="Nam" name="gender" type="radio" id="g-male" value="male" checked={form.gender === 'male'} onChange={handleChange} />
            <Form.Check inline label="Nữ" name="gender" type="radio" id="g-female" value="female" checked={form.gender === 'female'} onChange={handleChange} />
            <Form.Check inline label="Khác" name="gender" type="radio" id="g-other" value="other" checked={form.gender === 'other'} onChange={handleChange} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Thông tin thêm</Form.Label>
          <Form.Control as="textarea" rows={3} name="extra" value={form.extra} onChange={handleChange} />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit" variant="success" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          <Button variant="outline-primary" onClick={openPromote}>Thăng chức lên admin</Button>
        </div>
      </Form>

      <div className="mt-4">
        <strong>Chức vụ hiện tại:</strong> <span className="ms-2">{user.role}</span>
      </div>

      <Modal show={showPromote} onHide={() => setShowPromote(false)} centered>
        <Modal.Header closeButton><Modal.Title>Yêu cầu thăng chức lên admin</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>Để thăng chức bạn cần xác thực bằng Email hoặc Số điện thoại và mật khẩu hiện tại.</p>
          {promoteError && <Alert variant="danger">{promoteError}</Alert>}
          <Form.Group className="mb-2">
            <Form.Label>Email hoặc SĐT</Form.Label>
            <Form.Control value={confirm.identifier} onChange={e => setConfirm(prev => ({ ...prev, identifier: e.target.value }))} placeholder="Nhập email hoặc số điện thoại của bạn" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control type="password" value={confirm.password} onChange={e => setConfirm(prev => ({ ...prev, password: e.target.value }))} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPromote(false)}>Hủy</Button>
          <Button variant="primary" onClick={handlePromote} disabled={promoteLoading}>{promoteLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ThongTin;
