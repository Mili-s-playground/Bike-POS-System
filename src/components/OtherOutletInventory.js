import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Alert,
  Badge,
  Card,
  Button,
} from "react-bootstrap";
import Sidebar from "./Sidebar";
import api from "../services/api";

const OtherOutletInventory = () => {
  const { outlet } = useParams();
  const otherOutlet = outlet === "harigala" ? "arandara" : "harigala";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = ["Bicycle", "Accessories", "Parts", "Clothing", "Tools"];

  useEffect(() => {
    fetchProducts();
  }, [otherOutlet]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${otherOutlet}`);
      setProducts(response.data);
      setError("");
    } catch (error) {
      setError("Error fetching products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    setFilteredProducts(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (product.quantity <= product.minStockLevel) {
      return <Badge bg="warning">Low Stock</Badge>;
    } else {
      return <Badge bg="success">In Stock</Badge>;
    }
  };

  if (loading) {
    return (
      <Container fluid>
        <Row>
          <Col md={3} lg={2} className="px-0">
            <Sidebar outlet={outlet} />
          </Col>
          <Col md={9} lg={10}>
            <div className="p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="px-0">
          <Sidebar outlet={outlet} />
        </Col>
        <Col md={9} lg={10}>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="bi bi-eye me-2"></i>
                {otherOutlet.charAt(0).toUpperCase() +
                  otherOutlet.slice(1)}{" "}
                Outlet Inventory
                <small className="text-muted ms-2">(Read Only)</small>
              </h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-4">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("");
                  }}
                >
                  Clear
                </Button>
              </Col>
            </Row>

            <Card>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Selling Price</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <code>{product.sku}</code>
                          </td>
                          <td>{product.name}</td>
                          <td>{product.brand}</td>
                          <td>
                            <Badge bg="secondary">{product.category}</Badge>
                          </td>
                          <td>{formatCurrency(product.sellingPrice)}</td>
                          <td>{product.quantity}</td>
                          <td>{getStockStatus(product)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-box display-1 text-muted"></i>
                    <p className="text-muted">No products found</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="mt-4 p-3 bg-light rounded">
              <h6>
                <i className="bi bi-info-circle me-2"></i>Information
              </h6>
              <p className="mb-0 text-muted">
                This is a read-only view of{" "}
                {otherOutlet.charAt(0).toUpperCase() + otherOutlet.slice(1)}{" "}
                outlet's inventory. You can view product information and stock
                levels but cannot make any changes.
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OtherOutletInventory;
