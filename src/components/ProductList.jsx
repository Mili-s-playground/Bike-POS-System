import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Alert,
  Badge,
  Modal,
  Card,
  InputGroup,
} from "react-bootstrap";
import Sidebar from "./Sidebar";
import api from "../services/api";

const ProductList = () => {
  const { outlet } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const categories = ["Bicycle", "Accessories", "Parts", "Clothing", "Tools"];

  useEffect(() => {
    fetchProducts();
  }, [outlet]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

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

    if (categoryFilter) {
      filtered = filtered.filter(
          (product) => product.category === categoryFilter
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async () => {
    try {
      await api.delete(`/products/${outlet}/${productToDelete._id}`);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      setError("Error deleting product: " + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return <Badge bg="danger" className="fw-bold px-3 py-2">Out of Stock</Badge>;
    } else if (product.quantity <= product.minStockLevel) {
      return <Badge bg="warning" className="fw-bold px-3 py-2">Low Stock</Badge>;
    } else {
      return <Badge bg="success" className="fw-bold px-3 py-2">In Stock</Badge>;
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      "Bicycle": "primary",
      "Accessories": "info",
      "Parts": "secondary",
      "Clothing": "warning",
      "Tools": "dark"
    };
    return colors[category] || "secondary";
  };

  if (loading) {
    return (
        <Container fluid>
          <Row>
            <Col md={3} lg={2} className="px-0">
              <Sidebar outlet={outlet} />
            </Col>
            <Col md={9} lg={10}>
              <div className="p-5 text-center">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                  <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h5 className="text-muted">Loading products...</h5>
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
              {/* Header Section */}
              <Card className="border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {/*<Button*/}
                      {/*    variant="outline-light"*/}
                      {/*    size="sm"*/}
                      {/*    className="me-3"*/}
                      {/*    onClick={() => navigate('/dashboard')}*/}
                      {/*    style={{ borderRadius: '8px' }}*/}
                      {/*>*/}
                      {/*  <i className="bi bi-arrow-left me-1"></i>*/}
                      {/*  Back*/}
                      {/*</Button>*/}
                      <div>
                        <h2 className="mb-1 fw-bold">
                          <i className="bi bi-box-seam me-2"></i>
                          Product Inventory
                        </h2>
                        <p className="mb-0 opacity-75">
                          {outlet.charAt(0).toUpperCase() + outlet.slice(1)} Store • {filteredProducts.length} Products
                        </p>
                      </div>
                    </div>
                    <Button
                        variant="success"
                        size="lg"
                        className="fw-bold shadow-sm"
                        onClick={() => navigate(`/products/${outlet}/add`)}
                        style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New Product
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {error && (
                  <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
              )}

              {/* Filters Section */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                          <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search by name, brand, or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-start-0 ps-0"
                            style={{ borderRadius: '0 8px 8px 0' }}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Form.Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="fw-semibold"
                          style={{ borderRadius: '8px' }}
                      >
                        <option value="">🏷️ All Categories</option>
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
                          className="w-100 fw-semibold"
                          style={{ borderRadius: '8px' }}
                          onClick={() => {
                            setSearchTerm("");
                            setCategoryFilter("");
                          }}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Clear
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Products Table */}
              <Card className="border-0 shadow-sm" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Card.Body className="p-0">
                  {filteredProducts.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="mb-0" hover>
                          <thead style={{ background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)', position: 'sticky', top: 0, zIndex: 10 }}>
                          <tr className="text-white">
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-upc-scan me-2"></i>SKU
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-tag me-2"></i>Product
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-award me-2"></i>Brand
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-collection me-2"></i>Category
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-currency-dollar me-2"></i>Purchase
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-cash-coin me-2"></i>Selling
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-boxes me-2"></i>Qty
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-speedometer2 me-2"></i>Status
                            </th>
                            <th className="fw-bold py-3 border-0">
                              <i className="bi bi-gear me-2"></i>Actions
                            </th>
                          </tr>
                          </thead>
                          <tbody>
                          {filteredProducts.map((product, index) => (
                              <tr key={product._id} className={index % 2 === 0 ? "bg-light" : "bg-white"}>
                                <td className="py-3">
                                  <code className="bg-secondary text-white px-2 py-1 rounded fw-bold">
                                    {product.sku}
                                  </code>
                                </td>
                                <td className="py-3">
                                  <div className="fw-semibold text-dark">{product.name}</div>
                                </td>
                                <td className="py-3">
                                  <span className="text-muted fw-medium">{product.brand}</span>
                                </td>
                                <td className="py-3">
                                  <Badge bg={getCategoryBadgeColor(product.category)} className="fw-semibold px-3 py-2">
                                    {product.category}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  <span className="fw-bold text-success">{formatCurrency(product.purchasePrice)}</span>
                                </td>
                                <td className="py-3">
                                  <span className="fw-bold text-primary">{formatCurrency(product.sellingPrice)}</span>
                                </td>
                                <td className="py-3">
                                  <span className="fw-bold fs-6">{product.quantity}</span>
                                </td>
                                <td className="py-3">{getStockStatus(product)}</td>
                                <td className="py-3">
                                  <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="d-flex align-items-center fw-semibold"
                                        style={{ borderRadius: '6px' }}
                                        onClick={() =>
                                            navigate(`/products/${outlet}/edit/${product._id}`)
                                        }
                                    >
                                      <i className="bi bi-pencil-square"></i>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="d-flex align-items-center fw-semibold"
                                        style={{ borderRadius: '6px' }}
                                        onClick={() => {
                                          setProductToDelete(product);
                                          setShowDeleteModal(true);
                                        }}
                                    >
                                      <i className="bi bi-trash3"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </Table>
                      </div>
                  ) : (
                      <div className="text-center py-5">
                        <div className="mb-4">
                          <i className="bi bi-box-seam display-1 text-muted opacity-50"></i>
                        </div>
                        <h4 className="text-muted mb-2">No Products Found</h4>
                        <p className="text-muted mb-4">
                          {searchTerm || categoryFilter
                              ? "Try adjusting your search filters"
                              : "Start by adding your first product"}
                        </p>
                        {!searchTerm && !categoryFilter && (
                            <Button
                                variant="primary"
                                size="lg"
                                className="fw-bold shadow-sm"
                                style={{ borderRadius: '8px' }}
                                onClick={() => navigate(`/products/${outlet}/add`)}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Add Your First Product
                            </Button>
                        )}
                      </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Enhanced Delete Modal */}
        <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
            backdrop="static"
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="text-danger fw-bold">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Confirm Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2">
            <div className="text-center mb-3">
              <i className="bi bi-trash3 display-4 text-danger opacity-75"></i>
            </div>
            <p className="text-center mb-3">
              Are you sure you want to permanently delete this product?
            </p>
            {productToDelete && (
                <Card className="bg-light border-0">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 fw-bold">{productToDelete.name}</h6>
                        <small className="text-muted">SKU: {productToDelete.sku}</small>
                      </div>
                      <Badge bg="secondary">{productToDelete.category}</Badge>
                    </div>
                  </Card.Body>
                </Card>
            )}
            <div className="alert alert-warning border-0 mt-3 mb-0">
              <i className="bi bi-info-circle me-2"></i>
              <small>This action cannot be undone.</small>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
                variant="outline-secondary"
                className="fw-semibold px-4"
                style={{ borderRadius: '6px' }}
                onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
                variant="danger"
                className="fw-semibold px-4 shadow-sm"
                style={{ borderRadius: '6px' }}
                onClick={handleDeleteProduct}
            >
              <i className="bi bi-trash3 me-2"></i>
              Delete Product
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default ProductList;