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
        <div className="d-flex">
            <Sidebar outlet={outlet} />
            <div className="main-content">
                <div className="p-4">
                    <div className="page-header d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">
                            <i className="bi bi-speedometer2 me-3"></i>
                            Dashboard - {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                        </h2>
                        <div className="text-muted">
                            <i className="bi bi-calendar-date me-2"></i>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Row className="mb-4">
                                <Col xl={3} lg={6} md={6} className="mb-4">
                                    <Card className="dashboard-card summary-card bg-primary text-white h-100">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <Card.Title className="mb-2">Total Products</Card.Title>
                                                    <h2 className="mb-0">{stats.totalProducts}</h2>
                                                </div>
                                                <div className="text-end">
                                                    <i className="bi bi-box-seam" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xl={3} lg={6} md={6} className="mb-4">
                                    <Card className="dashboard-card bg-warning text-white h-100">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <Card.Title className="mb-2">Low Stock</Card.Title>
                                                    <h2 className="mb-0">{stats.lowStockProducts}</h2>
                                                </div>
                                                <div className="text-end">
                                                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xl={3} lg={6} md={6} className="mb-4">
                                    <Card className="dashboard-card bg-success text-white h-100">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <Card.Title className="mb-2">Today's Sales</Card.Title>
                                                    <h2 className="mb-0">{formatCurrency(stats.todaySales)}</h2>
                                                </div>
                                                <div className="text-end">
                                                    <i className="bi bi-currency-dollar" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xl={3} lg={6} md={6} className="mb-4">
                                    <Card className="dashboard-card bg-info text-white h-100">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <Card.Title className="mb-2">Today's Profit</Card.Title>
                                                    <h2 className="mb-0">{formatCurrency(stats.todayProfit)}</h2>
                                                </div>
                                                <div className="text-end">
                                                    <i className="bi bi-graph-up" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={6} className="mb-4">
                                    <Card className="dashboard-card h-100">
                                        <Card.Header>
                                            <h5 className="mb-0"><i className="bi bi-list-check me-2"></i>Quick Actions</h5>
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                                <div>
                                                    <i className="bi bi-plus-circle me-3 text-primary"></i>
                                                    <span>Add New Product</span>
                                                </div>
                                                <a href={`/products/${outlet}/add`} className="btn btn-sm btn-outline-primary">
                                                    Go <i className="bi bi-arrow-right ms-1"></i>
                                                </a>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                                <div>
                                                    <i className="bi bi-cart-plus me-3 text-success"></i>
                                                    <span>Create New Bill</span>
                                                </div>
                                                <a href={`/billing/${outlet}`} className="btn btn-sm btn-outline-success">
                                                    Go <i className="bi bi-arrow-right ms-1"></i>
                                                </a>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                                <div>
                                                    <i className="bi bi-arrow-up-circle me-3 text-warning"></i>
                                                    <span>Update Stock</span>
                                                </div>
                                                <a href={`/update-quantity/${outlet}`} className="btn btn-sm btn-outline-warning">
                                                    Go <i className="bi bi-arrow-right ms-1"></i>
                                                </a>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                                <div>
                                                    <i className="bi bi-graph-up me-3 text-info"></i>
                                                    <span>View Reports</span>
                                                </div>
                                                <a href={`/reports/${outlet}`} className="btn btn-sm btn-outline-info">
                                                    Go <i className="bi bi-arrow-right ms-1"></i>
                                                </a>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Card>
                                </Col>

                                <Col lg={6} className="mb-4">
                                    <Card className="dashboard-card h-100">
                                        <Card.Header>
                                            <h5 className="mb-0"><i className="bi bi-info-circle me-2"></i>System Information</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-3">
                                                <strong>Current Outlet:</strong>
                                                <span className="badge bg-primary ms-2">
                          {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                        </span>
                                            </div>
                                            <div className="mb-3">
                                                <strong>System Version:</strong> <span className="text-muted">1.0.0</span>
                                            </div>
                                            <div className="mb-3">
                                                <strong>Database:</strong> <span className="text-success">MongoDB Atlas</span>
                                            </div>
                                            <div className="mb-0">
                                                <strong>Last Updated:</strong> <span className="text-muted">{new Date().toLocaleString()}</span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;