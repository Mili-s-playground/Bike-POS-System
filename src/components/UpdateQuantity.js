import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Table,
  Badge,
} from "react-bootstrap";
import Sidebar from "./Sidebar";
import api from "../services/api";

const UpdateQuantity = () => {
  const { outlet } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updateQueue, setUpdateQueue] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [outlet]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${outlet}`);
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
    setFilteredProducts(filtered);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdateQueue((prev) => ({
      ...prev,
      [productId]: parseInt(newQuantity),
    }));
  };

  const updateProductQuantity = async (productId) => {
    try {
      const newQuantity = updateQueue[productId];
      if (newQuantity === undefined) return;

      await api.put(`/products/${outlet}/${productId}/quantity`, {
        quantity: newQuantity,
      });

      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, quantity: product.quantity + newQuantity }
            : product
        )
      );

      setUpdateQueue((prev) => {
        const newQueue = { ...prev };
        delete newQueue[productId];
        return newQueue;
      });

      setSuccess("Quantity updated successfully!");
      setTimeout(() => setSuccess(""), 3000);

    } catch (error) {
      setError("Error updating quantity: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStockStatus = (product) => {
    const currentQuantity =
      updateQueue[product._id] !== undefined
        ? updateQueue[product._id]
        : product.quantity;

    if (currentQuantity === 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (currentQuantity <= product.minStockLevel) {
      return <Badge bg="warning">Low Stock</Badge>;
    } else {
      return <Badge bg="success">In Stock</Badge>;
    }
  };

  const getCurrentQuantity = (product) => {
    return updateQueue[product._id] !== undefined
      ? updateQueue[product._id]
      : product.quantity;
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
                <i className="bi bi-arrow-up-circle me-2"></i>
                Update Stock Quantities -{" "}
                {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
              </h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row className="mb-4">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
            </Row>

            <Card>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Brand</th>
                        <th>Current Quantity</th>
                        <th>New Quantity</th>
                        <th>Status</th>
                        <th>Action</th>
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
                          <td>{product.quantity}</td>
                          <td>
                            <Form.Control
                                id="newQuanitiy"
                              type="number"
                              min="0"
                              value={getCurrentQuantity(product)}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product._id,
                                  e.target.value
                                )
                              }
                              style={{ width: "100px" }}
                            />
                          </td>
                          <td>{getStockStatus(product)}</td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => updateProductQuantity(product._id)}
                              // disabled={
                              //   updateQueue[product._id] === undefined ||
                              //   updateQueue[product._id] === product.quantity
                              // }
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Update
                            </Button>
                          </td>
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
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateQuantity;
