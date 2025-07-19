import React, { useState } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ outlet }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            path: `/dashboard/${outlet}`,
            icon: 'bi-speedometer2',
            label: 'Dashboard'
        },
        {
            path: `/products/${outlet}`,
            icon: 'bi-box-seam',
            label: 'View Products'
        },
        {
            path: `/products/${outlet}/add`,
            icon: 'bi-plus-circle',
            label: 'Add Product'
        },
        {
            path: `/update-quantity/${outlet}`,
            icon: 'bi-arrow-up-circle',
            label: 'Update Stock'
        },
        {
            path: `/billing/${outlet}`,
            icon: 'bi-receipt',
            label: 'Billing'
        },
        {
            path: `/other-outlet/${outlet}`,
            icon: 'bi-eye',
            label: 'Other Outlet'
        },
        {
            path: `/reports/${outlet}`,
            icon: 'bi-graph-up',
            label: 'Reports'
        }
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <Navbar.Brand className="sidebar-brand">
                    <i className="bi bi-bicycle brand-icon"></i>
                    {!isCollapsed && <span className="brand-text">Bike POS</span>}
                </Navbar.Brand>
                <button
                    className="sidebar-toggle"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
                </button>
            </div>

            {!isCollapsed && (
                <div className="outlet-info">
                    <div className="outlet-label">Current Outlet</div>
                    <div className="outlet-name">{outlet.charAt(0).toUpperCase() + outlet.slice(1)}</div>
                </div>
            )}

            <Nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Nav.Link
                        key={item.path}
                        href="#"
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                        }}
                        title={isCollapsed ? item.label : ''}
                    >
                        <i className={`${item.icon} nav-icon`}></i>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </Nav.Link>
                ))}

                <div className="nav-divider"></div>

                <Nav.Link
                    href="#"
                    className="nav-item"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                    }}
                    title={isCollapsed ? 'Change Outlet' : ''}
                >
                    <i className="bi bi-arrow-left nav-icon"></i>
                    {!isCollapsed && <span className="nav-label">Change Outlet</span>}
                </Nav.Link>

                {!isCollapsed && (
                    <div className="developer-info">
                        <div className="developer-title">Developed By:</div>
                        <div className="developer-names">Harshana & Milinda</div>
                        <div className="contact-title">Contact Us:</div>
                        <div className="contact-numbers">
                            <div>0768585130</div>
                            <div>0767828753</div>
                        </div>
                    </div>
                )}
            </Nav>
        </div>
    );
};

export default Sidebar;