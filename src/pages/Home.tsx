// pages/Home.tsx
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';

const Home = () => {
  const [featuredDishes, setFeaturedDishes] = React.useState<any[]>([]);
  const [restaurants, setRestaurants] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Lấy dữ liệu từ API json-server
    const fetchData = async () => {
      try {
        const dishesRes = await fetch('http://localhost:3000/dishes');
        const dishes = await dishesRes.json();
        const restaurantsRes = await fetch('http://localhost:3000/restaurants');
        const restaurantsData = await restaurantsRes.json();

        // Sắp xếp giảm dần theo rating
        const sortedDishes = [...dishes].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const sortedRestaurants = [...restaurantsData].sort((a, b) => (b.rating || 0) - (a.rating || 0));

        // Random lấy 3 món và 3 nhà hàng nổi bật
        const getRandom = (arr: any[], n: number) => {
          const copy = [...arr];
          const result = [];
          while (copy.length && result.length < n) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
          }
          return result;
        };

        setFeaturedDishes(getRandom(sortedDishes, 3));
        setRestaurants(getRandom(sortedRestaurants, 3));
      } catch (err) {
        setFeaturedDishes([]);
        setRestaurants([]);
      }
    };
    fetchData();
  }, []);

  return (
    <main>
      {/* Giới Thiệu */}
      <section className="py-5 bg-light">
        <Container>
          <h1 className="display-4 fw-bold text-success">Chào mừng đến với The PopFood!</h1>
          <p className="lead mb-4">
            Nơi thưởng thức những món ăn ngon từ khắp ba miền Việt Nam và đồ ăn vặt hấp dẫn.
          </p>
          <div className="d-grid gap-2 col-6 mx-auto">
            <Button variant="success" size="lg">
              Khám phá ngay!
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 1: Món ăn nổi bật */}
      <section className="py-5">
        <Container>
          <h2 className="display-6 fw-bold text-center mb-4">Món ăn nổi bật</h2>
          <Row xs={1} md={3} className="g-4">
            {featuredDishes.map((dish) => (
              <Col key={dish.id}>
                <DishCard dish={dish} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Section 2: Quán ăn */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="display-6 fw-bold text-center mb-4">Các quán ăn nổi bật</h2>
          <Row xs={1} md={3} className="g-4">
            {restaurants.map((res) => (
              <Col key={res.id}>
                <RestaurantCard restaurant={res} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Section 3: Call-to-action */}
      <section className="py-5 bg-success text-white">
        <Container>
          <h2 className="display-6 fw-bold mb-4">Bạn đang tìm kiếm gì?</h2>
          <p className="lead mb-4">
            Từ món ăn truyền thống đến đồ ăn vặt hấp dẫn, chúng tôi đều có!
          </p>
          <div className="d-grid gap-2 col-6 mx-auto">
            <Button variant="light" size="lg">
              Tìm kiếm ngay
            </Button>
          </div>
        </Container>
      </section>
      
     {/* Section 4: Giới thiệu về chúng tôi */}
<section className="py-5 bg-dark text-white">
  <Container>
    <h2 className="display-6 fw-bold text-center mb-4">Giới thiệu về chúng tôi</h2>
    
    {/* Phần 1: Giới thiệu chung */}
    <Row className="g-4 mb-4">
      <Col md={12}>
        <Card className="border-0 bg-success text-white h-100 shadow-lg">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-people-fill fs-1 me-3"></i>
              <Card.Title className="mb-0">Chúng Tôi PopFood</Card.Title>
            </div>
            <Card.Text className="fs-6">
              Là công ty giao hàng trong nước với ước mơ mang lại món ăn ba miền tới tận nhà, đảm bảo cả nhà cùng tận hưởng hương vị khắp 3 miền Việt Nam.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Phần 2: Trở thành đối tác tài xế */}
    <Row className="g-4 mb-4">
      <Col md={12}>
        <Card className="border-0 bg-success text-white h-100 shadow-lg">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-bicycle fs-1 me-3"></i>
              <Card.Title className="mb-0">Trở thành đối tác tài xế</Card.Title>
            </div>
            <Card.Text className="fs-6 mb-4">
              Bạn có thể trở thành đối tác 2 bánh hoặc 4 bánh xịn sò. Mục tiêu của chúng tôi là mang lại những món ăn thật ngon cho khách hàng!
            </Card.Text>
            <Row className="g-3">
              <Col md={6}>
                <Card className="border-0 bg-info text-white h-100 shadow-sm hover-shadow">
                  <Card.Body className="text-center p-3">
                    <div className="mb-2">
                      <i className="bi bi-motorcycle fs-2 me-2"></i>
                      <i className="bi bi-bicycle fs-2 me-2"></i>
                      <i className="bi bi-person-badge fs-2"></i>
                    </div>
                    <Card.Title className="fs-5">Đối tác 2 bánh</Card.Title>
                    <Card.Text className="small">
                      <i className="bi bi-clock me-1"></i>Giao hàng linh hoạt, 
                      <i className="bi bi-cash-coin me-1"></i>thu nhập hấp dẫn, 
                      <i className="bi bi-calendar-check me-1"></i>thời gian làm việc tự do.
                    </Card.Text>
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="mt-2 w-100 fw-bold text-success hover-scale"
                    >
                      Đăng ký ngay
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-primary text-white h-100 shadow-sm hover-shadow">
                  <Card.Body className="text-center p-3">
                    <i className="bi bi-truck fs-2 mb-2"></i>
                    <Card.Title className="fs-5">Đối tác 4 bánh</Card.Title>
                    <Card.Text className="small">
                      Giao hàng chuyên nghiệp, xe hiện đại, cơ hội phát triển nghề nghiệp.
                    </Card.Text>
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="mt-2 w-100 fw-bold text-primary hover-scale"
                    >
                      Đăng ký ngay
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Phần 3: Trở thành quán đối tác */}
    <Row className="g-4 mb-4">
      <Col md={12}>
        <Card className="border-0 bg-success text-white h-100 shadow-lg">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-shop fs-1 me-3"></i>
              <Card.Title className="mb-0">Trở thành quán đối tác</Card.Title>
            </div>
            <Card.Text className="fs-6 mb-4">
              Trở thành quán đối tác trong chuỗi quán POPFOOD. Cùng nhau lập mục tiêu chung đi theo con đường chung để phục vụ khách hàng.
            </Card.Text>
            <div className="d-flex justify-content-center">
              <Button 
                variant="light" 
                size="lg" 
                className="fw-bold text-success px-4 hover-scale"
              >
                <i className="bi bi-handshake me-2"></i>
                Đăng ký làm đối tác nhà hàng
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Phần 4: Ứng dụng POPFOOD */}
    <Row className="g-4">
      <Col md={12}>
        <Card className="border-0 bg-success text-white h-100 shadow-lg">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-phone fs-1 me-3"></i>
              <Card.Title className="mb-0">Ứng dụng POPFOOD</Card.Title>
            </div>
            <Card.Text className="fs-6">
              Đặt đồ ăn ngay qua ứng dụng POPFOOD! Món ăn sẽ giao ngay trong vòng 20 phút – Món ăn tới tận nhà.
            </Card.Text>
            <ul className="list-unstyled mt-3 mb-4">
              <li className="mb-2"><i className="bi bi-lightning-fill text-warning me-2"></i>Giao nhanh trong 20 phút</li>
              <li className="mb-2"><i className="bi bi-geo-alt-fill text-warning me-2"></i>Đa dạng món ăn 3 miền</li>
              <li className="mb-2"><i className="bi bi-phone-fill text-warning me-2"></i>Đặt hàng dễ dàng qua app</li>
              <li className="mb-2"><i className="bi bi-headset text-warning me-2"></i>Hỗ trợ khách hàng 24/7</li>
            </ul>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button 
                variant="dark" 
                className="px-4 hover-scale"
              >
                <i className="bi bi-google-play me-2"></i>
                Google Play
              </Button>
              <Button 
                variant="dark" 
                className="px-4 hover-scale"
              >
                <i className="bi bi-apple me-2"></i>
                App Store
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
</section>
    </main>
  );
};

export default Home;