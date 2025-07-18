import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const OutletSelection = () => {
  const navigate = useNavigate();

  const handleOutletSelect = (outlet) => {
    localStorage.setItem("selectedOutlet", outlet);
    navigate(`/dashboard/${outlet}`);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="text-center mb-5">
            <h1 className="display-4 text-primary">
              <i className="bi bi-bicycle"></i> Bike POS System
            </h1>
            <p className="lead">Select your outlet to continue</p>
          </div>

          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm outlet-card">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-shop display-1 text-primary"></i>
                  </div>
                  <Card.Title className="h3">හරිගල | Harigala Outlet</Card.Title>
                  <Card.Text className="text-muted">
                    Main branch location
                  </Card.Text>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    onClick={() => handleOutletSelect("harigala")}
                  >
                    Enter Harigala | හරිගල
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm outlet-card">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-shop display-1 text-success"></i>
                  </div>
                  <Card.Title className="h3">බලපත්තාව | Arandara  Outlet</Card.Title>
                  <Card.Text className="text-muted">
                    Secondary branch location
                  </Card.Text>
                  <Button
                    variant="success"
                    size="lg"
                    className="w-100"
                    onClick={() => handleOutletSelect("arandara")}
                  >
                    Enter Balpaththawa | බලපත්තාව
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default OutletSelection;
