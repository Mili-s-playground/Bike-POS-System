import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import Sidebar from './Sidebar';
import api from '../services/api';

const ProductForm = () => {
    const { outlet, id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        sku: '',
        purchasePrice: '',
        sellingPrice: '',
        quantity: '',
        minStockLevel: '10',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = ['Bicycle', 'Accessories', 'Parts', 'Clothing', 'Tools'];

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id, outlet, isEdit]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${outlet}/${id}`);
            const product = response.data;

            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                category: product.category || '',
                sku: product.sku || '',
                purchasePrice: product.purchasePrice?.toString() || '',
                sellingPrice: product.sellingPrice?.toString() || '',
                quantity: product.quantity?.toString() || '',
                minStockLevel: product.minStockLevel?.toString() || '10',
                description: product.description || ''
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Error fetching product: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Product name is required');
            }
            if (!formData.brand.trim()) {
                throw new Error('Brand is required');
            }
            if (!formData.category) {
                throw new Error('Category is required');
            }
            if (!formData.sku.trim()) {
                throw new Error('SKU is required');
            }
            if (!formData.purchasePrice || parseFloat(formData.purchasePrice) < 0) {
                throw new Error('Valid purchase price is required');
            }
            if (!formData.sellingPrice || parseFloat(formData.sellingPrice) < 0) {
                throw new Error('Valid selling price is required');
            }
            if (!formData.quantity || parseInt(formData.quantity) < 0) {
                throw new Error('Valid quantity is required');
            }

            const productData = {
                name: formData.name.trim(),
                brand: formData.brand.trim(),
                category: formData.category,
                sku: formData.sku.trim().toUpperCase(),
                purchasePrice: parseFloat(formData.purchasePrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                quantity: parseInt(formData.quantity),
                minStockLevel: parseInt(formData.minStockLevel) || 10,
                description: formData.description.trim(),
                outlet: outlet
            };

            console.log('Submitting product data:', productData);

            let response;
            if (isEdit) {
                response = await api.put(`/products/${outlet}/${id}`, productData);
                setSuccess('Product updated successfully!');
            } else {
                response = await api.post('/products', productData);
                setSuccess('Product added successfully!');

                // Reset form for new product
                setFormData({
                    name: '',
                    brand: '',
                    category: '',
                    sku: '',
                    purchasePrice: '',
                    sellingPrice: '',
                    quantity: '',
                    minStockLevel: '10',
                    description: ''
                });
            }

            console.log('Product saved:', response.data);

            // Navigate back after 2 seconds
            setTimeout(() => {
                navigate(`/products/${outlet}`);
            }, 2000);

        } catch (error) {
            console.error('Error saving product:', error);
            setError(error.response?.data?.error || error.message || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateSKU = () => {
        const prefix = outlet.toUpperCase().substring(0, 3);
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 3).toUpperCase();
        const newSKU = `${prefix}${timestamp}${random}`;

        setFormData(prev => ({
            ...prev,
            sku: newSKU
        }));
    };

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
                                <i className="bi bi-plus-circle me-2"></i>
                                {isEdit ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate(`/products/${outlet}`)}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Products
                            </Button>
                        </div>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Product Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter product name"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Brand *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="brand"
                                                    value={formData.brand}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter brand name"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Category *</Form.Label>
                                                <Form.Select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>SKU *</Form.Label>
                                                <div className="input-group">
                                                    <Form.Control
                                                        type="text"
                                                        name="sku"
                                                        value={formData.sku}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Enter SKU"
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        type="button"
                                                        onClick={generateSKU}
                                                    >
                                                        Generate
                                                    </Button>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Purchase Price (LKR) *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    name="purchasePrice"
                                                    value={formData.purchasePrice}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="0.00"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Selling Price (LKR) *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    name="sellingPrice"
                                                    value={formData.sellingPrice}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="0.00"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quantity *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="0"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Minimum Stock Level</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    name="minStockLevel"
                                                    value={formData.minStockLevel}
                                                    onChange={handleChange}
                                                    placeholder="10"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter product description (optional)"
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => navigate(`/products/${outlet}`)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    {isEdit ? 'Updating...' : 'Adding...'}
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    {isEdit ? 'Update Product' : 'Add Product'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductForm;