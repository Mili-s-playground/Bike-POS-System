import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
} from "react-bootstrap";
import Sidebar from "./Sidebar";
import api from "../services/api";

const Reports = () => {
  const { outlet } = useParams();
  const [activeTab, setActiveTab] = useState("sales");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "sales") {
      fetchSalesReport();
    } else {
      fetchInventoryReport();
    }
  }, [outlet, activeTab]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/reports/${outlet}/sales`, {
        params: {
          startDate,
          endDate,
        },
      });

      setSalesReport(response.data);
    } catch (error) {
      setError("Error fetching sales report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/reports/${outlet}/inventory`);
      setInventoryReport(response.data);
    } catch (error) {
      setError("Error fetching inventory report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handleDateRangeUpdate = () => {
    if (activeTab === "sales") {
      fetchSalesReport();
    }
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
                <i className="bi bi-graph-up me-2"></i>
                Reports - {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
              </h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4">
              <Card.Header>
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "sales" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("sales")}
                    >
                      <i className="bi bi-currency-dollar me-2"></i>
                      Sales Report
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "inventory" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("inventory")}
                    >
                      <i className="bi bi-box-seam me-2"></i>
                      Inventory Report
                    </button>
                  </li>
                </ul>
              </Card.Header>
              <Card.Body>
                {activeTab === "sales" && (
                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>&nbsp;</Form.Label>
                        <Button
                          variant="primary"
                          className="d-block"
                          onClick={handleDateRangeUpdate}
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "Update Report"}
                        </Button>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "sales" && salesReport && (
                  <>
                    <Row className="mb-4">
                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-primary text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Total Sales</Card.Title>
                                <h4>
                                  {formatCurrency(
                                    salesReport.summary.totalSales
                                  )}
                                </h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-currency-dollar display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-success text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Total Profit</Card.Title>
                                <h4>
                                  {formatCurrency(
                                    salesReport.summary.totalProfit
                                  )}
                                </h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-graph-up display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-info text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Total Bills</Card.Title>
                                <h4>{salesReport.summary.totalBills}</h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-receipt display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-warning text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Avg Order Value</Card.Title>
                                <h4>
                                  {formatCurrency(
                                    salesReport.summary.averageOrderValue
                                  )}
                                </h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-calculator display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Card className="mb-4">
                      <Card.Header>
                        <h5>
                          <i className="bi bi-trophy me-2"></i>Top Selling
                          Products
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="table-responsive">
                          <Table striped bordered hover>
                            <thead className="table-dark">
                              <tr>
                                <th>Rank</th>
                                <th>Product Name</th>
                                <th>Quantity Sold</th>
                                <th>Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {salesReport.topProducts &&
                                salesReport.topProducts.map(
                                  (product, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{product.name}</td>
                                      <td>{product.quantity}</td>
                                      <td>{formatCurrency(product.revenue)}</td>
                                    </tr>
                                  )
                                )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </>
                )}

                {activeTab === "inventory" && inventoryReport && (
                  <>
                    <Row className="mb-4">
                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-primary text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Total Products</Card.Title>
                                <h4>{inventoryReport.summary.totalProducts}</h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-box-seam display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-success text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Total Value</Card.Title>
                                <h4>
                                  {formatCurrency(
                                    inventoryReport.summary.totalValue
                                  )}
                                </h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-currency-dollar display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-warning text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Low Stock</Card.Title>
                                <h4>{inventoryReport.summary.lowStockCount}</h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-exclamation-triangle display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={3} md={6} className="mb-3">
                        <Card className="bg-danger text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Card.Title>Out of Stock</Card.Title>
                                <h4>
                                  {inventoryReport.summary.outOfStockCount}
                                </h4>
                              </div>
                              <div className="align-self-center">
                                <i className="bi bi-x-circle display-4"></i>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
