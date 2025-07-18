import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import OutletSelection from "./components/OutletSelection";
import Dashboard from "./components/Dashboard";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import UpdateQuantity from "./components/UpdateQuantity";
import Billing from "./components/Billing";
import OtherOutletInventory from "./components/OtherOutletInventory";
import Reports from "./components/Reports";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OutletSelection />} />
          <Route path="/dashboard/:outlet" element={<Dashboard />} />
          <Route path="/products/:outlet" element={<ProductList />} />
          <Route path="/products/:outlet/add" element={<ProductForm />} />
          <Route path="/products/:outlet/edit/:id" element={<ProductForm />} />
          <Route path="/update-quantity/:outlet" element={<UpdateQuantity />} />
          <Route path="/billing/:outlet" element={<Billing />} />
          <Route
            path="/other-outlet/:outlet"
            element={<OtherOutletInventory />}
          />
          <Route path="/reports/:outlet" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
