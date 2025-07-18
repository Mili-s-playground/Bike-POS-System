// src/components/Billing.js - Fixed with proper scrolling
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, Table, Modal } from 'react-bootstrap';
import Sidebar from './Sidebar';
import api from '../services/api';

const Billing = () => {
    const { outlet } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: ''
    });
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBillModal, setShowBillModal] = useState(false);
    const [generatedBill, setGeneratedBill] = useState(null);

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
            setProducts(response.data.filter(p => p.quantity > 0));
            setError('');
        } catch (error) {
            setError('Error fetching products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(filtered);
    };

    const addToCart = (product) => {
        const existingItem = cartItems.find(item => item.productId === product._id);

        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                setError('Cannot add more items than available in stock');
                setTimeout(() => setError(''), 3000);
                return;
            }

            setCartItems(prev => prev.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCartItems(prev => [...prev, {
                productId: product._id,
                name: product.name,
                price: product.sellingPrice,
                quantity: 1,
                maxQuantity: product.quantity
            }]);
        }
    };

    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p._id === productId);
        if (newQuantity > product.quantity) {
            setError('Cannot exceed available stock');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setCartItems(prev => prev.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0; // 0% tax
        const total = subtotal + tax - discount;

        return { subtotal, tax, total };
    };

    const handleCreateBill = async () => {
        if (cartItems.length === 0) {
            setError('Please add items to cart');
            return;
        }

        try {
            setProcessing(true);
            setError('');

            const billData = {
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                discount,
                paymentMethod,
                outlet
            };

            const response = await api.post('/bills', billData);
            setGeneratedBill(response.data);
            setShowBillModal(true);

            // Reset form
            setCartItems([]);
            setCustomerInfo({ name: '', phone: '' });
            setDiscount(0);
            setPaymentMethod('Cash');

            // Refresh products to update quantities
            fetchProducts();

            setSuccess('Bill created successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error creating bill: ' + error.response?.data?.error || error.message);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    const { subtotal, tax, total } = calculateTotals();

    if (loading) {
        return (
            <div className="d-flex">
                <Sidebar outlet={outlet} />
                <div className="main-content">
                    <div className="p-4 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex">
            <Sidebar outlet={outlet} />
            <div className="main-content">
                <div className="p-4 billing-container">
                    <div className="page-header d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">
                            <i className="bi bi-receipt me-3"></i>
                            Billing - {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                        </h2>
                        <div className="d-flex align-items-center">
              <span className="badge bg-primary fs-6 me-3">
                Cart: {cartItems.length} items
              </span>
                            <span className="badge bg-success fs-6">
                Total: {formatCurrency(total)}
              </span>
                        </div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <div className="billing-layout">
                        {/* Products Section */}
                        <div className="products-section">
                            <Card className="h-100">
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-search me-2"></i>Product Search
                                    </h5>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div className="p-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="🔍 Search products to add to cart..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="form-control-lg"
                                        />
                                    </div>

                                    <div className="products-table-container">
                                        <Table striped hover className="mb-0">
                                            <thead className="table-dark sticky-top">
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredProducts.map(product => (
                                                <tr key={product._id}>
                                                    <td>
                                                        <div>
                                                            <strong>{product.name}</strong>
                                                            <br />
                                                            <small className="text-muted">{product.brand} • {product.sku}</small>
                                                        </div>
                                                    </td>
                                                    <td className="fw-bold text-success">
                                                        {formatCurrency(product.sellingPrice)}
                                                    </td>
                                                    <td>
                              <span className={`badge ${product.quantity > 10 ? 'bg-success' : product.quantity > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                {product.quantity}
                              </span>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.quantity === 0}
                                                        >
                                                            <i className="bi bi-plus-circle me-1"></i>
                                                            Add
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>

                                        {filteredProducts.length === 0 && (
                                            <div className="empty-state">
                                                <i className="bi bi-search"></i>
                                                <p>No products found</p>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        {/* Cart and Billing Section */}
                        <div className="cart-section">
                            <Card className="h-100">
                                <Card.Header className="bg-success text-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-cart me-2"></i>Shopping Cart ({cartItems.length})
                                    </h5>
                                </Card.Header>
                                <Card.Body className="cart-body">
                                    {/* Cart Items */}
                                    <div className="cart-items-container">
                                        {cartItems.length === 0 ? (
                                            <div className="empty-cart text-center">
                                                <i className="bi bi-cart-x display-4 text-muted"></i>
                                                <p className="text-muted">No items in cart</p>
                                                <p className="small text-muted">Search and add products from the left</p>
                                            </div>
                                        ) : (
                                            <div className="cart-items">
                                                {cartItems.map(item => (
                                                    <div key={item.productId} className="cart-item">
                                                        <div className="cart-item-info">
                                                            <div className="cart-item-name">{item.name}</div>
                                                            <div className="cart-item-price">{formatCurrency(item.price)} × {item.quantity}</div>
                                                            <div className="cart-item-total fw-bold text-success">
                                                                {formatCurrency(item.price * item.quantity)}
                                                            </div>
                                                        </div>
                                                        <div className="cart-item-controls">
                                                            <div className="quantity-controls">
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                                                >
                                                                    -
                                                                </Button>
                                                                <span className="quantity-display">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                                                    disabled={item.quantity >= item.maxQuantity}
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removeFromCart(item.productId)}
                                                                title="Remove item"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Cart Summary */}
                                    {cartItems.length > 0 && (
                                        <div className="cart-summary">
                                            <div className="summary-line">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(subtotal)}</span>
                                            </div>
                                            <div className="summary-line">
                                                <span>Tax (10%):</span>
                                                <span>{formatCurrency(tax)}</span>
                                            </div>
                                            <div className="summary-line">
                                                <span>Discount:</span>
                                                <span>-{formatCurrency(discount)}</span>
                                            </div>
                                            <hr />
                                            <div className="summary-line total-line">
                                                <span>Total:</span>
                                                <span>{formatCurrency(total)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Customer and Payment Info */}
                                    <div className="customer-payment-section">
                                        <h6 className="section-title">
                                            <i className="bi bi-person me-2"></i>Customer Information
                                        </h6>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Customer Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={customerInfo.name}
                                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter customer name (optional)"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="Enter phone number (optional)"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Discount (LKR)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max={subtotal}
                                                value={discount}
                                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Payment Method</Form.Label>
                                            <Form.Select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>

                                    {/* Fixed Billing Button */}
                                    <div className="billing-button-section">
                                        <Button
                                            variant="success"
                                            size="lg"
                                            className="w-100 create-bill-btn"
                                            onClick={handleCreateBill}
                                            disabled={processing || cartItems.length === 0}
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Create Bill ({formatCurrency(total)})
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill Receipt Modal */}
            <Modal show={showBillModal} onHide={() => setShowBillModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Bill Receipt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {generatedBill && (
                        <div className="receipt">
                            <div className="text-center mb-4">
                                <h4>Bike POS System</h4>
                                <p className="text-muted">
                                    {outlet.charAt(0).toUpperCase() + outlet.slice(1)} Outlet
                                </p>
                                <p><strong>Bill #: {generatedBill.billNumber}</strong></p>
                                <p>Date: {new Date(generatedBill.createdAt).toLocaleString()}</p>
                            </div>

                            {generatedBill.customerName && (
                                <div className="mb-3">
                                    <p><strong>Customer:</strong> {generatedBill.customerName}</p>
                                    {generatedBill.customerPhone && (
                                        <p><strong>Phone:</strong> {generatedBill.customerPhone}</p>
                                    )}
                                </div>
                            )}

                            <Table striped bordered size="sm">
                                <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {generatedBill.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatCurrency(item.unitPrice)}</td>
                                        <td>{formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            <div className="text-end">
                                <p>Subtotal: {formatCurrency(generatedBill.subtotal)}</p>
                                <p>Tax: {formatCurrency(generatedBill.tax)}</p>
                                <p>Discount: -{formatCurrency(generatedBill.discount)}</p>
                                <h5>Total: {formatCurrency(generatedBill.total)}</h5>
                                <p>Payment: {generatedBill.paymentMethod}</p>
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-muted">Thank you for your business!</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i>
                        Print
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Billing;