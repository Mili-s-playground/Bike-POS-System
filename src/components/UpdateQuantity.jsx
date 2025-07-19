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
        <Container fluid className="vh-100">
          <Row className="h-100">
            <Col md={3} lg={2} className="px-0">
              <Sidebar outlet={outlet} />
            </Col>
            <Col md={9} lg={10} className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Loading inventory...</h5>
              </div>
            </Col>
          </Row>
        </Container>
    );
  }

  return (
      <Container fluid className="vh-100">
        <Row className="h-100">
          {/* Sidebar */}
          <Col md={3} lg={2} className="px-0 bg-light border-end">
            <Sidebar outlet={outlet} />
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10} className="d-flex flex-column overflow-hidden">

            {/* Fixed Header */}
            <div className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1020 }}>
              <div className="p-4">
                {/* Professional Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="mb-1 fw-bold text-dark d-flex align-items-center">
                      <i className="bi bi-box-arrow-up-right me-3 text-primary"></i>
                      Inventory Management
                    </h2>
                    <p className="mb-0 text-muted fw-medium">
                      {outlet.charAt(0).toUpperCase() + outlet.slice(1)} Store
                      {getPendingUpdatesCount() > 0 && (
                          <span className="ms-3 text-warning">
                        <i className="bi bi-clock me-1"></i>
                            {getPendingUpdatesCount()} pending updates
                      </span>
                      )}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="h4 mb-0 fw-bold text-primary">{filteredProducts.length}</div>
                    <small className="text-muted">Products</small>
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '8px' }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div><strong>Error:</strong> {error}</div>
                      </div>
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="border-0 mb-3" style={{ borderRadius: '8px' }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div><strong>Success:</strong> {success}</div>
                      </div>
                    </Alert>
                )}

                {/* Search Bar */}
                <Row className="g-3 align-items-center">
                  <Col md={8}>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                          type="text"
                          placeholder="Search by name, brand, or SKU..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-start-0"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    {getPendingUpdatesCount() > 0 && (
                        <div className="text-end">
                          <Badge bg="warning" text="dark" className="px-3 py-2 fw-semibold">
                            <i className="bi bi-hourglass-split me-2"></i>
                            {getPendingUpdatesCount()} Pending
                          </Badge>
                        </div>
                    )}
                  </Col>
                </Row>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow-1 overflow-auto">
              <div className="p-4">

                {/* Main Table Card */}
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0 py-3">
                    <h5 className="mb-0 fw-semibold d-flex align-items-center">
                      <i className="bi bi-table me-2"></i>
                      Stock Management
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {filteredProducts.length > 0 ? (
                        <div className="table-responsive">
                          <Table className="mb-0 align-middle" hover>
                            <thead className="bg-light">
                            <tr>
                              <th className="fw-semibold py-3 border-0 text-dark">
                                <i className="bi bi-upc-scan me-2 text-primary"></i>SKU
                              </th>
                              <th className="fw-semibold py-3 border-0 text-dark">
                                <i className="bi bi-box me-2 text-primary"></i>Product
                              </th>
                              <th className="fw-semibold py-3 border-0 text-dark text-center">
                                <i className="bi bi-archive me-2 text-primary"></i>Current
                              </th>
                              <th className="fw-semibold py-3 border-0 text-dark text-center">
                                <i className="bi bi-pencil me-2 text-primary"></i>Update To
                              </th>
                              <th className="fw-semibold py-3 border-0 text-dark text-center">
                                <i className="bi bi-graph-up me-2 text-primary"></i>Status
                              </th>
                              <th className="fw-semibold py-3 border-0 text-dark text-center">
                                <i className="bi bi-gear me-2 text-primary"></i>Action
                              </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr
                                    key={product._id}
                                    className={`
                                ${index % 2 === 0 ? "bg-white" : "bg-light bg-opacity-50"} 
                                ${hasChanges(product._id) ? 'border-start border-warning border-3' : ''}
                              `}
                                >
                                  <td className="py-3">
                                    <code className="bg-dark text-white px-2 py-1 rounded fw-bold small">
                                      {product.sku}
                                    </code>
                                  </td>
                                  <td className="py-3">
                                    <div>
                                      <div className="fw-semibold text-dark mb-1">{product.name}</div>
                                      <div className="text-muted small">
                                        <i className="bi bi-tag me-1"></i>
                                        {product.brand}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 text-center">
                                    <div className="d-flex flex-column align-items-center">
                                      <span className="fw-bold h5 mb-0 text-dark">{product.quantity}</span>
                                      <small className="text-muted">units</small>
                                    </div>
                                  </td>
                                  <td className="py-3 text-center">
                                    <div style={{ width: '100px', margin: '0 auto' }}>
                                      <Form.Control
                                          type="number"
                                          min="0"
                                          value={getCurrentQuantity(product)}
                                          onChange={(e) =>
                                              handleQuantityChange(
                                                  product._id,
                                                  e.target.value
                                              )
                                          }
                                          className={`text-center fw-semibold ${hasChanges(product._id) ? 'border-warning bg-warning bg-opacity-10' : ''}`}
                                          size="sm"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-3 text-center">
                                    {getStockStatus(product)}
                                  </td>
                                  <td className="py-3 text-center">
                                    <Button
                                        variant={hasChanges(product._id) ? "success" : "outline-primary"}
                                        size="sm"
                                        className="fw-semibold px-3"
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
                          <div className="mb-4">
                            <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                          </div>
                          <h4 className="text-muted mb-2">No Products Found</h4>
                          <p className="text-muted mb-3">
                            {searchTerm
                                ? "No products match your search criteria."
                                : "No products available for stock updates."}
                          </p>
                          {searchTerm && (
                              <Button
                                  variant="outline-primary"
                                  onClick={() => setSearchTerm("")}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                Clear Search
                              </Button>
                          )}
                        </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Quick Stats */}
                {filteredProducts.length > 0 && (
                    <Row className="mt-4 g-3">
                      <Col md={3}>
                        <Card className="border-0 bg-primary bg-opacity-10 text-center h-100">
                          <Card.Body className="py-4">
                            <i className="bi bi-boxes text-primary display-6 mb-2"></i>
                            <h4 className="fw-bold mb-1 text-primary">{filteredProducts.length}</h4>
                            <small className="text-muted">Total Products</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="border-0 bg-warning bg-opacity-10 text-center h-100">
                          <Card.Body className="py-4">
                            <i className="bi bi-exclamation-triangle text-warning display-6 mb-2"></i>
                            <h4 className="fw-bold mb-1 text-warning">
                              {filteredProducts.filter(p => p.quantity <= p.minStockLevel && p.quantity > 0).length}
                            </h4>
                            <small className="text-muted">Low Stock</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="border-0 bg-danger bg-opacity-10 text-center h-100">
                          <Card.Body className="py-4">
                            <i className="bi bi-x-circle text-danger display-6 mb-2"></i>
                            <h4 className="fw-bold mb-1 text-danger">
                              {filteredProducts.filter(p => p.quantity === 0).length}
                            </h4>
                            <small className="text-muted">Out of Stock</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="border-0 bg-info bg-opacity-10 text-center h-100">
                          <Card.Body className="py-4">
                            <i className="bi bi-clock text-info display-6 mb-2"></i>
                            <h4 className="fw-bold mb-1 text-info">{getPendingUpdatesCount()}</h4>
                            <small className="text-muted">Pending Updates</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
  );
};

export default UpdateQuantity;