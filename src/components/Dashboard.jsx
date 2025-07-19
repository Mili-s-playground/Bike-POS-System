import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import Sidebar from './Sidebar';
import api from '../services/api';

const Dashboard = () => {
    const { outlet } = useParams();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockProducts: 0,
        todaySales: 0,
        todayProfit: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [outlet]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch inventory report
            const inventoryResponse = await api.get(`/reports/${outlet}/inventory`);

            // Fetch today's sales
            const today = new Date().toISOString().split('T')[0];
            const salesResponse = await api.get(`/reports/${outlet}/sales`, {
                params: { startDate: today, endDate: today }
            });

            setStats({
                totalProducts: inventoryResponse.data.summary.totalProducts,
                lowStockProducts: inventoryResponse.data.summary.lowStockCount,
                todaySales: salesResponse.data.summary.totalSales,
                todayProfit: salesResponse.data.summary.totalProfit
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    return (
        <div className="app-container">
            <Sidebar outlet={outlet} />
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="page-header">
                        <h2 className="page-title">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Dashboard - {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                        </h2>
                        <div className="page-date">
                            <i className="bi bi-calendar-date me-2"></i>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="loading-text">Loading dashboard data...</p>
                        </div>
                    ) : (
                        <div className="dashboard-content">
                            <div className="stats-grid">
                                <Card className="stat-card stat-primary">
                                    <Card.Body>
                                        <div className="stat-content">
                                            <div className="stat-info">
                                                <h3 className="stat-title">Total Products</h3>
                                                <div className="stat-value">{stats.totalProducts}</div>
                                            </div>
                                            <div className="stat-icon">
                                                <i className="bi bi-box-seam"></i>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="stat-card stat-warning">
                                    <Card.Body>
                                        <div className="stat-content">
                                            <div className="stat-info">
                                                <h3 className="stat-title">Low Stock</h3>
                                                <div className="stat-value">{stats.lowStockProducts}</div>
                                            </div>
                                            <div className="stat-icon">
                                                <i className="bi bi-exclamation-triangle"></i>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="stat-card stat-success">
                                    <Card.Body>
                                        <div className="stat-content">
                                            <div className="stat-info">
                                                <h3 className="stat-title">Today's Sales</h3>
                                                <div className="stat-value">{formatCurrency(stats.todaySales)}</div>
                                            </div>
                                            <div className="stat-icon">
                                                <i className="bi bi-currency-dollar"></i>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="stat-card stat-info">
                                    <Card.Body>
                                        <div className="stat-content">
                                            <div className="stat-info">
                                                <h3 className="stat-title">Today's Profit</h3>
                                                <div className="stat-value">{formatCurrency(stats.todayProfit)}</div>
                                            </div>
                                            <div className="stat-icon">
                                                <i className="bi bi-graph-up"></i>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>

                            <div className="cards-grid">
                                <Card className="action-card">
                                    <Card.Header>
                                        <h5 className="card-title">
                                            <i className="bi bi-list-check me-2"></i>
                                            Quick Actions
                                        </h5>
                                    </Card.Header>
                                    <div className="action-list">
                                        <div className="action-item">
                                            <div className="action-info">
                                                <i className="bi bi-plus-circle action-icon text-primary"></i>
                                                <span className="action-label">Add New Product</span>
                                            </div>
                                            <a href={`/products/${outlet}/add`} className="btn btn-sm btn-outline-primary">
                                                Go <i className="bi bi-arrow-right ms-1"></i>
                                            </a>
                                        </div>
                                        <div className="action-item">
                                            <div className="action-info">
                                                <i className="bi bi-cart-plus action-icon text-success"></i>
                                                <span className="action-label">Create New Bill</span>
                                            </div>
                                            <a href={`/billing/${outlet}`} className="btn btn-sm btn-outline-success">
                                                Go <i className="bi bi-arrow-right ms-1"></i>
                                            </a>
                                        </div>
                                        <div className="action-item">
                                            <div className="action-info">
                                                <i className="bi bi-arrow-up-circle action-icon text-warning"></i>
                                                <span className="action-label">Update Stock</span>
                                            </div>
                                            <a href={`/update-quantity/${outlet}`} className="btn btn-sm btn-outline-warning">
                                                Go <i className="bi bi-arrow-right ms-1"></i>
                                            </a>
                                        </div>
                                        <div className="action-item">
                                            <div className="action-info">
                                                <i className="bi bi-graph-up action-icon text-info"></i>
                                                <span className="action-label">View Reports</span>
                                            </div>
                                            <a href={`/reports/${outlet}`} className="btn btn-sm btn-outline-info">
                                                Go <i className="bi bi-arrow-right ms-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="info-card">
                                    <Card.Header>
                                        <h5 className="card-title">
                                            <i className="bi bi-info-circle me-2"></i>
                                            System Information
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <strong>Current Outlet:</strong>
                                                <span className="badge bg-primary ms-2">
                                                    {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <strong>System Version:</strong>
                                                <span className="text-muted">1.0.0</span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Database:</strong>
                                                <span className="text-success">MongoDB Atlas</span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Last Updated:</strong>
                                                <span className="text-muted">{new Date().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;