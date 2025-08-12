// src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type FormState = { name: string; email: string; phone: string; gender: 'male' | 'female' | 'other'; password: string; confirmPassword: string; };

const validateEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const validatePhone = (s: string) => /^\+?\d{8,15}$/.test(s.replace(/\s+/g, ''));

const Register: React.FC = () => {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', gender: 'male', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Vui lòng nhập họ tên.';
    if (!form.email.trim()) err.email = 'Vui lòng nhập email.'; else if (!validateEmail(form.email.trim())) err.email = 'Email không hợp lệ.';
    if (!form.phone.trim()) err.phone = 'Vui lòng nhập số điện thoại.'; else if (!validatePhone(form.phone.trim())) err.phone = 'Số điện thoại không hợp lệ.';
    if (!form.password) err.password = 'Vui lòng nhập mật khẩu.'; else if (form.password.length < 6) err.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), gender: form.gender, extra: '', password: form.password });
      navigate('/login');
    } catch (err: any) {
      setErrors({ email: err.message || 'Không thể đăng ký' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title mb-3">Đăng ký</h3>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label">Họ và tên</label>
                  <input name="name" value={form.name} onChange={handleChange} className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="Nguyễn Văn A" />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="you@example.com" />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className={`form-control ${errors.phone ? 'is-invalid' : ''}`} placeholder="+8498xxxxxxx" />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Giới tính</label>
                  <div className="btn-group" role="group" aria-label="Giới tính">
                    <input type="radio" className="btn-check" name="gender" id="g-male" value="male" checked={form.gender === 'male'} onChange={handleChange} />
                    <label className="btn btn-outline-secondary" htmlFor="g-male">Nam</label>

                    <input type="radio" className="btn-check" name="gender" id="g-female" value="female" checked={form.gender === 'female'} onChange={handleChange} />
                    <label className="btn btn-outline-secondary" htmlFor="g-female">Nữ</label>

                    <input type="radio" className="btn-check" name="gender" id="g-other" value="other" checked={form.gender === 'other'} onChange={handleChange} />
                    <label className="btn btn-outline-secondary" htmlFor="g-other">Khác</label>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input name="password" value={form.password} onChange={handleChange} type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>

                <div className="d-grid mb-2">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Đang tạo tài khoản...</> : <>Tạo tài khoản</>}
                  </button>
                </div>

                <div className="text-center">
                  <small>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></small>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-3 text-muted small">Bằng việc tạo tài khoản bạn đồng ý với <a href="/terms">Điều khoản</a>.</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
