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
  InputGroup, ButtonGroup,
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
      <div className="app-container">
        <Sidebar outlet={outlet} />
        <main className="main-content">
          <div className="content-wrapper">
            {/* Header Section */}
            <div className="page-header">
              <h2 className="page-title">
                <i className="bi bi-box-seam me-2"></i>
                Product Inventory
              </h2>
              <div className="page-date">
                {outlet.charAt(0).toUpperCase() + outlet.slice(1)} Store • {filteredProducts.length} Products
              </div>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
            )}

            {/* Filters Section */}
            <Card className="mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
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
                        className="w-100"
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

            {/* Products Table - Scrollable Area */}
            <div className="table-container">
              <Card>
                <Card.Body className="p-0">
                  {filteredProducts.length > 0 ? (
                      <div className="table-responsive">
                        <Table hover>
                          <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Purchase</th>
                            <th>Selling</th>
                            <th>Qty</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                          {filteredProducts.map((product) => (
                              <tr key={product._id}>
                                <td>{product.sku}</td>
                                <td>{product.name}</td>
                                <td>{product.brand}</td>
                                <td>
                                  <Badge bg={getCategoryBadgeColor(product.category)}>
                                    {product.category}
                                  </Badge>
                                </td>
                                <td>{formatCurrency(product.purchasePrice)}</td>
                                <td>{formatCurrency(product.sellingPrice)}</td>
                                <td>{product.quantity}</td>
                                <td>{getStockStatus(product)}</td>
                                <td>
                                  <ButtonGroup>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => navigate(`/products/${outlet}/edit/${product._id}`)}
                                    >
                                      <i className="bi bi-pencil-square"></i>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => {
                                          setProductToDelete(product);
                                          setShowDeleteModal(true);
                                        }}
                                    >
                                      <i className="bi bi-trash3"></i>
                                    </Button>
                                  </ButtonGroup>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </Table>
                      </div>
                  ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-box-seam display-4 text-muted mb-3"></i>
                        <h4>No Products Found</h4>
                        <p className="text-muted mb-4">
                          {searchTerm || categoryFilter
                              ? "Try adjusting your search filters"
                              : "Start by adding your first product"}
                        </p>
                        {!searchTerm && !categoryFilter && (
                            <Button
                                variant="primary"
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
          </div>
        </main>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {productToDelete && (
                <div>
                  <p>Are you sure you want to delete this product?</p>
                  <Card className="mb-3">
                    <Card.Body>
                      <h5>{productToDelete.name}</h5>
                      <p className="text-muted">SKU: {productToDelete.sku}</p>
                    </Card.Body>
                  </Card>
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    This action cannot be undone.
                  </Alert>
                </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
  );
};

export default ProductList;