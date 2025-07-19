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
  InputGroup,
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
      return <Badge bg="danger" className="fw-semibold px-3 py-2">Out of Stock</Badge>;
    } else if (currentQuantity <= product.minStockLevel) {
      return <Badge bg="warning" text="dark" className="fw-semibold px-3 py-2">Low Stock</Badge>;
    } else {
      return <Badge bg="success" className="fw-semibold px-3 py-2">In Stock</Badge>;
    }
  };

  const getCurrentQuantity = (product) => {
    return updateQueue[product._id] !== undefined
        ? updateQueue[product._id]
        : product.quantity;
  };

  const hasChanges = (productId) => {
    return updateQueue[productId] !== undefined;
  };

  const getPendingUpdatesCount = () => {
    return Object.keys(updateQueue).length;
  };

  if (loading) {
    return (
        <div className="app-container">
          <Sidebar outlet={outlet} />
          <main className="main-content">
            <div className="content-wrapper text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted">Loading inventory...</h5>
            </div>
          </main>
        </div>
    );
  }

  return (
      <div className="app-container">
        <Sidebar outlet={outlet} />
        <main className="main-content">
          <div className="content-wrapper">
            {/* Header Section */}
            <div className="page-header">
              <h2 className="page-title">
                <i className="bi bi-box-arrow-up-right me-2"></i>
                Inventory Management
              </h2>
              <div className="page-date">
                {outlet.charAt(0).toUpperCase() + outlet.slice(1)} Store
                {getPendingUpdatesCount() > 0 && (
                    <span className="ms-3 text-warning">
                <i className="bi bi-clock me-1"></i>
                      {getPendingUpdatesCount()} pending updates
              </span>
                )}
              </div>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="mb-4">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                </Alert>
            )}

            {/* Search Bar */}
            <Card className="mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={8}>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="bi bi-search text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                          type="text"
                          placeholder="Search by name, brand, or SKU..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4} className="text-end">
                    {getPendingUpdatesCount() > 0 && (
                        <Badge bg="warning" text="dark" className="px-3 py-2">
                          <i className="bi bi-hourglass-split me-2"></i>
                          {getPendingUpdatesCount()} Pending
                        </Badge>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Main Table - Scrollable Area */}
            <div className="table-container">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-table me-2"></i>
                    Stock Management
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {filteredProducts.length > 0 ? (
                      <div className="table-responsive">
                        <Table hover>
                          <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product</th>
                            <th>Current</th>
                            <th>Update To</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                          </thead>
                          <tbody>
                          {filteredProducts.map((product) => (
                              <tr key={product._id} className={hasChanges(product._id) ? 'table-warning' : ''}>
                                <td>{product.sku}</td>
                                <td>
                                  <div className="fw-semibold">{product.name}</div>
                                  <small className="text-muted">{product.brand}</small>
                                </td>
                                <td className="text-center">
                                  <span className="fw-bold">{product.quantity}</span>
                                </td>
                                <td className="text-center">
                                  <Form.Control
                                      type="number"
                                      min="0"
                                      value={getCurrentQuantity(product)}
                                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                                      className="text-center"
                                  />
                                </td>
                                <td className="text-center">
                                  {getStockStatus(product)}
                                </td>
                                <td className="text-center">
                                  <Button
                                      variant={hasChanges(product._id) ? "success" : "outline-primary"}
                                      size="sm"
                                      onClick={() => updateProductQuantity(product._id)}
                                  >
                                    {hasChanges(product._id) ? (
                                        <>
                                          <i className="bi bi-check-circle me-1"></i>
                                          Apply
                                        </>
                                    ) : (
                                        <>
                                          <i className="bi bi-arrow-repeat me-1"></i>
                                          Update
                                        </>
                                    )}
                                  </Button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </Table>
                      </div>
                  ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                        <h4>No Products Found</h4>
                        <p className="text-muted mb-3">
                          {searchTerm
                              ? "No products match your search criteria."
                              : "No products available for stock updates."}
                        </p>
                        {searchTerm && (
                            <Button variant="outline-primary" onClick={() => setSearchTerm("")}>
                              Clear Search
                            </Button>
                        )}
                      </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            {/* Quick Stats */}
            {filteredProducts.length > 0 && (
                <Row className="mt-4 g-3">
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <i className="bi bi-boxes text-primary display-6 mb-2"></i>
                        <h4 className="fw-bold mb-1">{filteredProducts.length}</h4>
                        <small className="text-muted">Total Products</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <i className="bi bi-exclamation-triangle text-warning display-6 mb-2"></i>
                        <h4 className="fw-bold mb-1">
                          {filteredProducts.filter(p => p.quantity <= p.minStockLevel && p.quantity > 0).length}
                        </h4>
                        <small className="text-muted">Low Stock</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <i className="bi bi-x-circle text-danger display-6 mb-2"></i>
                        <h4 className="fw-bold mb-1">
                          {filteredProducts.filter(p => p.quantity === 0).length}
                        </h4>
                        <small className="text-muted">Out of Stock</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <i className="bi bi-clock text-info display-6 mb-2"></i>
                        <h4 className="fw-bold mb-1">{getPendingUpdatesCount()}</h4>
                        <small className="text-muted">Pending Updates</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
            )}
          </div>
        </main>
      </div>
  );
};

export default UpdateQuantity;