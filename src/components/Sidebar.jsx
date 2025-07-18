import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ outlet }) => {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <div className="sidebar pt-2">
            <Navbar.Brand className="navbar-brand">
                <i className="bi bi-bicycle me-2 fs-2"></i>
                Bike POS
            </Navbar.Brand>

            <div className="p-3 border-bottom border-light border-opacity-25">
                <small className="text-light opacity-75 d-block fs-3 fw-bold">Current Outlet</small>
                <div className="fw-bold text-capitalize text-warning">{outlet}</div>
            </div>

            <Nav className="flex-column">
                {menuItems.map((item) => (
                    <Nav.Link
                        key={item.path}
                        href="#"
                        className={`nav-link px-3 py-3 fs-4 ${
                            location.pathname === item.path ? 'active' : ''
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                        }}
                    >
                        <i className={`${item.icon} me-2 fs-2`}></i>
                        {item.label}
                    </Nav.Link>
                ))}

                <hr className="mx-3 border-light border-opacity-25" />

                <Nav.Link
                    href="#"
                    className="nav-link px-3 py-3"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                    }}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Change Outlet
                </Nav.Link>

                <Nav.Link
                    href="#"
                    className="nav-link px-3 py-3"
                >
                    Developed By:<br></br>
                    Harshana & Millinda<br></br>
                    Contact Us:<br></br>
                    0768585130<br></br>
                    0767828753<br></br>
                </Nav.Link>

            </Nav>
        </div>
    );
};

export default Sidebar;