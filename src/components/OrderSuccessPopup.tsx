import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string | string[];
}

interface OrderSuccessPopupProps {
  show: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const OrderSuccessPopup: React.FC<OrderSuccessPopupProps> = ({ show, onClose, cartItems }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <i className="bi bi-check-circle-fill me-2"></i>Thanh toán thành công!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-success fw-bold">Món ăn sẽ được giao trong 20 phút nữa.</p>
        <h5 className="mb-3">Danh sách món ăn:</h5>
        {cartItems.length === 0 ? (
          <p>Không có món ăn nào.</p>
        ) : (
          <ListGroup>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onClose}>
          <i className="bi bi-arrow-left me-2"></i>Tiếp tục mua sắm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderSuccessPopup;