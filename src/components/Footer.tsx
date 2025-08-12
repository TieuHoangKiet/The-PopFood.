// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-success text-white py-5">
      <div className="container">
        <div className="row">
          {/* Công ty */}
          <div className="col-md-4">
            <h5>Công ty</h5>
            <ul className="list-unstyled">
              <li><i className="bi bi-info-circle me-2"></i><Link to="/about" className="text-white">Giới thiệu</Link></li>
              <li><i className="bi bi-question-circle me-2"></i><Link to="/support" className="text-white">Trung tâm Trợ giúp</Link></li>
              <li><i className="bi bi-file-earmark-text me-2"></i><Link to="/terms" className="text-white">Quy chế</Link></li>
              <li><i className="bi bi-lock me-2"></i><Link to="/privacy" className="text-white">Điều khoản sử dụng</Link></li>
              <li><i className="bi bi-exclamation-triangle me-2"></i><Link to="/dispute" className="text-white">Bảo mật thông tin</Link></li>
              <li><i className="bi bi-envelope me-2"></i><Link to="/contact" className="text-white">Liên hệ</Link></li>
              <li><i className="bi bi-person-plus me-2"></i><Link to="/partner" className="text-white">Hợp tác nhân viên giao nhận</Link></li>
              <li><i className="bi bi-blog me-2"></i><Link to="/blog" className="text-white">PopFood Blog</Link></li>
            </ul>
          </div>

          {/* Ứng dụng PopFood */}
          <div className="col-md-4">
            <h5>Ứng dụng PopFood</h5>
            <div className="d-grid gap-2">
              <a href="#" className="btn btn-dark text-white w-100">
                <i className="bi bi-apple me-2"></i> App Store
              </a>
              <a href="#" className="btn btn-dark text-white w-100">
                <i className="bi bi-android me-2"></i> Google Play
              </a>
              <a href="#" className="btn btn-dark text-white w-100">
                <i className="bi bi-hexagon me-2"></i> AppGallery
              </a>
            </div>
          </div>

          {/* Địa chỉ công ty */}
          <div className="col-md-4">
            <h5>Địa chỉ công ty</h5>
            <address>
              <img src="https://via.placeholder.com/50" alt="Logo PopFood" className="me-2" />
              © 2025 PopFood<br />
              Công Ty Cổ Phần Foody<br />
              Lầu G, Tòa nhà Jabes 1, Quận 1, TP.HCM<br />
              Giấy CN ĐKDN số: 0311828036<br />
              Do Sở Kế hoạch và Đầu tư TP.HCM cấp ngày 11/6/2012, sửa đổi lần thứ 23, ngày 10/12/2020<br />
              Chịu trách nhiệm quản lý nội dung và vấn đề bảo vệ quyền lợi người tiêu dùng: Nguyễn Hồ Quảng Giang<br />
              Điện thoại liên hệ: 028 71096879<br />
              Email: cskh@support.popfood.vn
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;