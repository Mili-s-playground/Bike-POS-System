import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
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
    const [formErrors, setFormErrors] = useState({});

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

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) errors.name = 'Product name is required';
        if (!formData.brand.trim()) errors.brand = 'Brand is required';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.sku.trim()) errors.sku = 'SKU is required';
        if (!formData.purchasePrice || parseFloat(formData.purchasePrice) < 0)
            errors.purchasePrice = 'Valid purchase price is required';
        if (!formData.sellingPrice || parseFloat(formData.sellingPrice) < 0)
            errors.sellingPrice = 'Valid selling price is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0)
            errors.quantity = 'Valid quantity is required';

        if (formData.purchasePrice && formData.sellingPrice &&
            parseFloat(formData.sellingPrice) < parseFloat(formData.purchasePrice)) {
            errors.sellingPrice = 'Selling price should be greater than purchase price';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fix the errors below');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
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

            let response;
            if (isEdit) {
                response = await api.put(`/products/${outlet}/${id}`, productData);
                setSuccess('Product updated successfully!');
            } else {
                response = await api.post('/products', productData);
                setSuccess('Product added successfully!');
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

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
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

        if (formErrors.sku) {
            setFormErrors(prev => ({
                ...prev,
                sku: ''
            }));
        }
    };

    const calculateMargin = () => {
        const purchase = parseFloat(formData.purchasePrice) || 0;
        const selling = parseFloat(formData.sellingPrice) || 0;
        if (purchase > 0 && selling > 0) {
            return ((selling - purchase) / purchase * 100).toFixed(1);
        }
        return 0;
    };

    return (
        <div className="app-container">
            <Sidebar outlet={outlet} />
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="page-header">
                        <h2 className="page-title">
                            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <div className="page-date">
                            <i className="bi bi-shop me-2"></i>
                            {outlet.charAt(0).toUpperCase() + outlet.slice(1)} Store
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="loading-text">Loading product data...</p>
                        </div>
                    ) : (
                        <div className="dashboard-content">
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

                            <Card className="mb-4">
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-clipboard-data me-2"></i>
                                        Product Information
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            {/* Basic Information Section */}
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Product Name *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Enter product name"
                                                        className={formErrors.name ? 'is-invalid' : ''}
                                                    />
                                                    {formErrors.name && (
                                                        <div className="invalid-feedback">{formErrors.name}</div>
                                                    )}
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Brand *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="brand"
                                                        value={formData.brand}
                                                        onChange={handleChange}
                                                        placeholder="Enter brand name"
                                                        className={formErrors.brand ? 'is-invalid' : ''}
                                                    />
                                                    {formErrors.brand && (
                                                        <div className="invalid-feedback">{formErrors.brand}</div>
                                                    )}
                                                </Form.Group>
                                            </div>

                                            {/* Category & SKU Section */}
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Category *</Form.Label>
                                                    <Form.Select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className={formErrors.category ? 'is-invalid' : ''}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(category => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </Form.Select>
                                                    {formErrors.category && (
                                                        <div className="invalid-feedback">{formErrors.category}</div>
                                                    )}
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>SKU *</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="text"
                                                            name="sku"
                                                            value={formData.sku}
                                                            onChange={handleChange}
                                                            placeholder="Enter SKU"
                                                            className={formErrors.sku ? 'is-invalid' : ''}
                                                        />
                                                        <Button
                                                            variant="outline-primary"
                                                            type="button"
                                                            onClick={generateSKU}
                                                        >
                                                            <i className="bi bi-magic me-1"></i>
                                                            Generate
                                                        </Button>
                                                    </InputGroup>
                                                    {formErrors.sku && (
                                                        <div className="invalid-feedback">{formErrors.sku}</div>
                                                    )}
                                                </Form.Group>
                                            </div>

                                            {/* Pricing Section */}
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Purchase Price (LKR) *</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>Rs.</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            name="purchasePrice"
                                                            value={formData.purchasePrice}
                                                            onChange={handleChange}
                                                            placeholder="0.00"
                                                            className={formErrors.purchasePrice ? 'is-invalid' : ''}
                                                        />
                                                    </InputGroup>
                                                    {formErrors.purchasePrice && (
                                                        <div className="invalid-feedback">{formErrors.purchasePrice}</div>
                                                    )}
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Selling Price (LKR) *</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>Rs.</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            name="sellingPrice"
                                                            value={formData.sellingPrice}
                                                            onChange={handleChange}
                                                            placeholder="0.00"
                                                            className={formErrors.sellingPrice ? 'is-invalid' : ''}
                                                        />
                                                    </InputGroup>
                                                    {formErrors.sellingPrice && (
                                                        <div className="invalid-feedback">{formErrors.sellingPrice}</div>
                                                    )}
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Profit Margin</Form.Label>
                                                    <div className="form-control bg-light d-flex align-items-center">
                                                        <i className="bi bi-graph-up text-success me-2"></i>
                                                        <span className="fw-bold text-success">
                                                            {calculateMargin()}%
                                                        </span>
                                                    </div>
                                                </Form.Group>
                                            </div>

                                            {/* Inventory Section */}
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Initial Quantity *</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            name="quantity"
                                                            value={formData.quantity}
                                                            onChange={handleChange}
                                                            placeholder="0"
                                                            className={formErrors.quantity ? 'is-invalid' : ''}
                                                        />
                                                        <InputGroup.Text>units</InputGroup.Text>
                                                    </InputGroup>
                                                    {formErrors.quantity && (
                                                        <div className="invalid-feedback">{formErrors.quantity}</div>
                                                    )}
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Minimum Stock Level</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            name="minStockLevel"
                                                            value={formData.minStockLevel}
                                                            onChange={handleChange}
                                                            placeholder="10"
                                                        />
                                                        <InputGroup.Text>units</InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>

                                            {/* Description Section */}
                                            <div className="col-12">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        placeholder="Enter product description, specifications, or notes..."
                                                    />
                                                </Form.Group>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="col-12">
                                                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                                    <Button
                                                        variant="light"
                                                        onClick={() => navigate(`/products/${outlet}`)}
                                                        disabled={loading}
                                                    >
                                                        <i className="bi bi-x-circle me-2"></i>
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
                                                                <i className={`bi ${isEdit ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                                                                {isEdit ? 'Update Product' : 'Add Product'}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProductForm;