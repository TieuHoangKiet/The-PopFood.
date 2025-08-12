// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Image, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getCartItemCount } from '../services/cartService';
import { getCurrentUser, logout } from '../services/authService';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Header: React.FC = () => {
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateAll = () => {
      setCartItemCount(getCartItemCount());
      setUser(getCurrentUser());
    };

    updateAll();
    window.addEventListener('storage', updateAll);
    window.addEventListener('pp_user_changed', updateAll as EventListener);

    return () => {
      window.removeEventListener('storage', updateAll);
      window.removeEventListener('pp_user_changed', updateAll as EventListener);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  const isAdmin = () => {
    if (!user) return false;
    return String(user.role || '').toLowerCase().includes('admin');
  };

  return (
    <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid className="px-4">
        <div className="d-flex align-items-center w-100" style={{ minHeight: 64 }}>
          <Navbar.Brand as="a" href="/" className="d-flex align-items-center" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
            <Image src="/thepopshoporg.png" alt="Logo" fluid style={{ width: '60px', height: 'auto' }} />
            <span className="ms-2 fw-bold fs-4 text-white">POPFOOD</span>
          </Navbar.Brand>

          <div className="flex-grow-1 d-flex justify-content-center">
            <form className="d-flex align-items-center position-relative" style={{ maxWidth: 400, width: '100%' }} onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement | null)?.value.trim();
              if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
            }}>
              <input type="text" name="search" className="form-control rounded-pill ps-4 pe-5" placeholder="Tìm Kiếm" autoComplete="off" style={{ height: 40 }} />
              <button type="submit" className="btn position-absolute end-0 top-0 h-100 bg-transparent border-0" style={{ paddingRight: 12 }} tabIndex={-1}>
                <i className="bi bi-search text-success fs-5" />
              </button>
            </form>
          </div>

          <div className="d-flex align-items-center ms-3">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </div>
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center flex-row flex-nowrap gap-2" style={{ whiteSpace: 'nowrap' }}>
            <Nav.Link as={Link} to="/"><i className="bi bi-house-door fs-5 me-2" />Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/restaurants"><i className="bi bi-shop-window fs-5 me-2" />Quán ăn</Nav.Link>
            <Nav.Link as={Link} to="/menu"><i className="bi bi-egg-fried fs-5 me-2" />Món ăn</Nav.Link>

            <Nav.Link as={Link} to="/cart" className="position-relative">
              <i className="bi bi-cart3 fs-5 me-2" />Giỏ hàng
              {cartItemCount > 0 && <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">{cartItemCount}</span>}
            </Nav.Link>

            {user ? (
              <NavDropdown title={<><i className="bi bi-person-circle fs-5 me-2" />{user.name || user.email || 'Tài khoản'}</>} id="user-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/information">Thông tin</NavDropdown.Item>
                {isAdmin() && <NavDropdown.Item as={Link} to="/admin">Quản trị (Admin)</NavDropdown.Item>}
                <NavDropdown.Item disabled>Chức vụ: {user.role}</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn btn-light d-flex align-items-center"><i className="bi bi-person-circle fs-5 me-2" />Đăng nhập</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
