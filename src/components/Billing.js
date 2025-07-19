import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Alert,
    Card,
    Table,
    Modal,
    Badge,
    InputGroup,
    ButtonGroup,
    Toast,
    ToastContainer
} from 'react-bootstrap';
import Sidebar from './Sidebar';
import api from '../services/api';

const Billing = () => {
    const { outlet } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [cartHistory, setCartHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
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
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, [outlet]);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm]);

    useEffect(() => {
        // Focus search input on component mount
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
            } else if (e.key === 'F1') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, cartHistory]);

    const showNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const saveToHistory = (newCartItems) => {
        const newHistory = cartHistory.slice(0, historyIndex + 1);
        newHistory.push([...newCartItems]);
        setCartHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCartItems([...cartHistory[historyIndex - 1]]);
            showNotification('Action undone', 'info');
        }
    };

    const redo = () => {
        if (historyIndex < cartHistory.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCartItems([...cartHistory[historyIndex + 1]]);
            showNotification('Action redone', 'info');
        }
    };

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
                showNotification('Cannot add more items than available in stock', 'warning');
                return;
            }

            const newCartItems = cartItems.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            setCartItems(newCartItems);
            saveToHistory(newCartItems);
        } else {
            const newCartItems = [...cartItems, {
                productId: product._id,
                name: product.name,
                price: product.sellingPrice,
                quantity: 1,
                maxQuantity: product.quantity
            }];
            setCartItems(newCartItems);
            saveToHistory(newCartItems);
        }
        showNotification(`${product.name} added to cart`, 'success');
    };

    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p._id === productId);
        if (newQuantity > product.quantity) {
            showNotification('Cannot exceed available stock', 'warning');
            return;
        }

        const newCartItems = cartItems.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
        );
        setCartItems(newCartItems);
        saveToHistory(newCartItems);
    };

    const removeFromCart = (productId) => {
        const newCartItems = cartItems.filter(item => item.productId !== productId);
        setCartItems(newCartItems);
        saveToHistory(newCartItems);
        showNotification('Item removed from cart', 'info');
    };

    const clearCart = () => {
        const newCartItems = [];
        setCartItems(newCartItems);
        saveToHistory(newCartItems);
        showNotification('Cart cleared', 'info');
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0; // 0% tax
        const total = subtotal + tax - discount;

        return { subtotal, tax, total };
    };

    const handleCreateBill = async () => {
        if (cartItems.length === 0) {
            showNotification('Please add items to cart', 'warning');
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
            setCartHistory([]);
            setHistoryIndex(-1);
            setCustomerInfo({ name: '', phone: '' });
            setDiscount(0);
            setPaymentMethod('Cash');

            // Refresh products to update quantities
            fetchProducts();

            showNotification('Bill created successfully!', 'success');
        } catch (error) {
            setError('Error creating bill: ' + error.response?.data?.error || error.message);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    const { subtotal, tax, total } = calculateTotals();

    if (loading) {
        return (
            <div className="pos-container">
                <Sidebar outlet={outlet} />
                <div className="pos-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <h5>Loading POS System...</h5>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pos-container">
            <Sidebar outlet={outlet} />

            <main className="pos-main">
                {/* Compact Header */}
                <header className="pos-header">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="pos-title">
                                <i className="bi bi-shop"></i>
                                POS System
                            </h1>
                            <span className="outlet-badge">{outlet.charAt(0).toUpperCase() + outlet.slice(1)}</span>
                        </div>

                        <div className="header-center">
                            <div className="search-container">
                                <div className="search-wrapper">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="search-input"
                                        placeholder="Search products... (F1)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="header-right">
                            <div className="action-buttons">
                                <button
                                    className="action-btn undo-btn"
                                    onClick={undo}
                                    disabled={historyIndex <= 0}
                                    title="Undo (Ctrl+Z)"
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                </button>
                                <button
                                    className="action-btn redo-btn"
                                    onClick={redo}
                                    disabled={historyIndex >= cartHistory.length - 1}
                                    title="Redo (Ctrl+Y)"
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                                <button
                                    className="action-btn clear-btn"
                                    onClick={clearCart}
                                    disabled={cartItems.length === 0}
                                    title="Clear Cart"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                            <div className="cart-summary">
                                <div className="cart-info">
                                    <span className="cart-items">{cartItems.length} items</span>
                                    <span className="cart-total">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {error && <div className="alert alert-error">{error}</div>}

                {/* Main Content */}
                <div className="pos-content">
                    {/* Products Section - Left Side with Independent Scroll */}
                    <section className="products-section">
                        <div className="products-header">
                            <h3>
                                <i className="bi bi-grid-3x3-gap"></i>
                                Products
                            </h3>
                            <span className="products-count">{filteredProducts.length} items</span>
                        </div>

                        <div className="products-scroll-container">
                            <div className="products-grid">
                                {filteredProducts.map(product => (
                                    <div key={product._id} className="product-card" onClick={() => addToCart(product)}>
                                        <div className="product-info">
                                            <h4 className="product-name">{product.name}</h4>
                                            <p className="product-details">{product.brand} • {product.sku}</p>
                                            <div className="product-footer">
                                                <span className="product-price">{formatCurrency(product.sellingPrice)}</span>
                                                <StockBadge quantity={product.quantity} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="empty-state">
                                    <i className="bi bi-search"></i>
                                    <p>No products found</p>
                                    <small>Try adjusting your search terms</small>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Cart Section - Right Side Full Height */}
                    <section className="cart-section">
                        <div className="cart-header">
                            <h3>
                                <i className="bi bi-cart"></i>
                                Shopping Cart
                            </h3>
                            <span className="cart-count">{cartItems.length} items</span>
                        </div>

                        <div className="cart-content">
                            {cartItems.length === 0 ? (
                                <div className="empty-cart">
                                    <i className="bi bi-cart-x"></i>
                                    <p>Your cart is empty</p>
                                    <small>Click on products to add them</small>
                                </div>
                            ) : (
                                <div className="cart-items-scroll">
                                    <div className="cart-items">
                                        {cartItems.map(item => (
                                            <div key={item.productId} className="cart-item">
                                                <div className="item-details">
                                                    <h5 className="item-name">{item.name}</h5>
                                                    <p className="item-price">{formatCurrency(item.price)} each</p>
                                                </div>
                                                <div className="item-controls">
                                                    <div className="quantity-controls">
                                                        <button
                                                            className="qty-btn minus"
                                                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                                        >
                                                            <i className="bi bi-dash"></i>
                                                        </button>
                                                        <span className="quantity">{item.quantity}</span>
                                                        <button
                                                            className="qty-btn plus"
                                                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                                            disabled={item.quantity >= item.maxQuantity}
                                                        >
                                                            <i className="bi bi-plus"></i>
                                                        </button>
                                                    </div>
                                                    <div className="item-total">{formatCurrency(item.price * item.quantity)}</div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => removeFromCart(item.productId)}
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cart Summary & Checkout - Fixed at bottom */}
                        <div className="cart-footer">
                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Discount:</span>
                                    <span className="discount">-{formatCurrency(discount)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <div className="customer-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Customer Name"
                                        value={customerInfo.name}
                                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                                    />
                                    {/*<input*/}
                                    {/*    type="text"*/}
                                    {/*    className="form-input"*/}
                                    {/*    placeholder="Phone"*/}
                                    {/*    value={customerInfo.phone}*/}
                                    {/*    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}*/}
                                    {/*/>*/}
                                </div>
                                <div className="form-row">
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Discount (LKR)"
                                        value={discount || ''}
                                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                                        min="0"
                                        max={subtotal}
                                    />
                                    <select
                                        className="form-select"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className="checkout-btn"
                                onClick={handleCreateBill}
                                disabled={processing || cartItems.length === 0}
                            >
                                {processing ? (
                                    <>
                                        <div className="spinner"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle"></i>
                                        Complete Sale - {formatCurrency(total)}
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Bill Receipt Modal */}
            <BillReceiptModal
                show={showBillModal}
                onHide={() => setShowBillModal(false)}
                bill={generatedBill}
                outlet={outlet}
                formatCurrency={formatCurrency}
            />

            {/* Toast Notifications */}
            <ToastContainer position="top-end" className="toast-container">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    className={`custom-toast ${toastType}`}
                >
                    <Toast.Body>
                        <i className={`bi bi-${toastType === 'success' ? 'check-circle' : toastType === 'warning' ? 'exclamation-triangle' : 'info-circle'}`}></i>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

// StockBadge Component
const StockBadge = ({ quantity }) => {
    let className = "stock-badge success";
    if (quantity === 0) className = "stock-badge danger";
    else if (quantity <= 5) className = "stock-badge warning";

    return (
        <span className={className}>
            {quantity} in stock
        </span>
    );
};

// BillReceiptModal Component
const BillReceiptModal = ({ show, onHide, bill, outlet, formatCurrency }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - Bill #${bill?.billNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; width: 300px; margin: 0 auto; }
                    .receipt { padding: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-header h3 { margin: 0; font-size: 18px; }
                    .receipt-info { display: flex; justify-content: space-between; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
                    .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .final { font-weight: bold; border-top: 2px solid #000; padding-top: 5px; }
                    .receipt-footer { text-align: center; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="receipt-header">
                        <h3>🚴‍♂️ Bike Shop POS</h3>
                        <p>${outlet.charAt(0).toUpperCase() + outlet.slice(1)} Outlet</p>
                        <div class="receipt-info">
                            <span>Bill #: ${bill?.billNumber}</span>
                            <span>${new Date(bill?.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    ${bill?.customerName ? `
                        <div class="customer-info">
                            <h4>Customer: ${bill.customerName}</h4>
                            ${bill.customerPhone ? `<p>Phone: ${bill.customerPhone}</p>` : ''}
                        </div>
                    ` : ''}
                    <table>
                        <thead>
                            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            ${bill?.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.unitPrice)}</td>
                                    <td>${formatCurrency(item.totalPrice)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="receipt-totals">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(bill?.subtotal)}</span>
                        </div>
                        <div class="total-row">
                            <span>Discount:</span>
                            <span>-${formatCurrency(bill?.discount)}</span>
                        </div>
                        <div class="total-row final">
                            <span>Total:</span>
                            <span>${formatCurrency(bill?.total)}</span>
                        </div>
                        <p>Payment: ${bill?.paymentMethod}</p>
                    </div>
                    <div class="receipt-footer">
                        <p>Thank you for your business! 🙏</p>
                        <small>POS System v2.0</small>
                    </div>
                </div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!show || !bill) return null;

    return (
        <div className={`modal-overlay ${show ? 'active' : ''}`} onClick={onHide}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className="bi bi-receipt"></i>
                        Bill Receipt
                    </h2>
                    <button className="close-btn" onClick={onHide}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="receipt">
                        <div className="receipt-header">
                            <h3>🚴‍♂️ Bike Shop POS</h3>
                            <p>{outlet.charAt(0).toUpperCase() + outlet.slice(1)} Outlet</p>
                            <div className="receipt-info">
                                <span>Bill #: {bill.billNumber}</span>
                                <span>{new Date(bill.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        {bill.customerName && (
                            <div className="customer-info">
                                <h4>Customer Information</h4>
                                <p>Name: {bill.customerName}</p>
                                {bill.customerPhone && <p>Phone: {bill.customerPhone}</p>}
                            </div>
                        )}

                        <div className="receipt-items">
                            <table>
                                <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bill.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatCurrency(item.unitPrice)}</td>
                                        <td>{formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="receipt-totals">
                            <div className="total-row">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(bill.subtotal)}</span>
                            </div>
                            <div className="total-row">
                                <span>Discount:</span>
                                <span className="discount">-{formatCurrency(bill.discount)}</span>
                            </div>
                            <div className="total-row final">
                                <span>Total:</span>
                                <span>{formatCurrency(bill.total)}</span>
                            </div>
                            <div className="payment-method">
                                Payment: {bill.paymentMethod}
                            </div>
                        </div>

                        <div className="receipt-footer">
                            <p>Thank you for your business! 🙏</p>
                            <small>POS System v2.0</small>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn secondary" onClick={onHide}>
                        <i className="bi bi-x-circle"></i>
                        Close
                    </button>
                    <button className="btn primary" onClick={handlePrint}>
                        <i className="bi bi-printer"></i>
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;