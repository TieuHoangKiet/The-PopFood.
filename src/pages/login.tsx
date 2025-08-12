// src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type FormState = { identifier: string; password: string; };

const validateEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const validatePhone = (s: string) => /^\+?\d{8,15}$/.test(s.replace(/\s+/g, ''));

const Login: React.FC = () => {
  const [form, setForm] = useState<FormState>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.identifier.trim()) err.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
    else {
      const v = form.identifier.trim();
      if (v.includes('@')) { if (!validateEmail(v)) err.identifier = 'Email không hợp lệ.'; }
      else { if (!validatePhone(v)) err.identifier = 'Số điện thoại không hợp lệ.'; }
    }
    if (!form.password) err.password = 'Vui lòng nhập mật khẩu.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.login(form.identifier.trim(), form.password);
      // authService.login will notify via events; navigate home
      navigate('/');
    } catch (err: any) {
      setErrors({ password: err.message || 'Đăng nhập thất bại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title mb-3">Đăng nhập</h3>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label">Email hoặc SĐT</label>
                  <input name="identifier" value={form.identifier} onChange={handleChange} type="text" className={`form-control ${errors.identifier ? 'is-invalid' : ''}`} placeholder="ví dụ: user@gmail.com hoặc 0989xxxxxx" autoComplete="username" />
                  {errors.identifier && <div className="invalid-feedback">{errors.identifier}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-group">
                    <input name="password" value={form.password} onChange={handleChange} type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Mật khẩu" autoComplete="current-password" />
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                  </div>
                </div>

                <div className="d-grid mb-2">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Đang đăng nhập...</> : <>Đăng nhập</>}
                  </button>
                </div>

                <div className="text-center">
                  <small>Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link></small>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-3 text-muted small">(Dùng tài khoản demo: <code>demo@demo.com</code> / <code>demo123</code>)</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
