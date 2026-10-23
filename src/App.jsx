
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import AdminPage from "./admin/Admin";
import CustomerReservation from "./customer/CustomerReservation";
import LandingPage from "./LandingPage";
import CustomerChatSupport from "./customer/CustomerChatSupport";
import CustomerRooms from "./customer/CustomerRooms";
import CustomerPage from "./customer/CustomerPage";
import AuthPage from "./login/AuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/*for testing, remove this later*/}
        <Route path="/customer" element={<CustomerPage />} />

        {/* Login routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/admin/login" element={<AuthPage />} />

        {/* Customer side routing*/}
        <Route path="/my-reservation" element={<CustomerPage />} />
        <Route path="/rooms" element={<CustomerPage />} />
        <Route path="/chat-support" element={<CustomerPage />} />

        {/* Admin/Staff side routing*/}

        {/* Admin dashboard and management pages */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />

        {/* Staff dashboard and management pages */}
        <Route path="/staff" element={<AdminPage role="staff" />} />
        <Route path="/staff/*" element={<AdminPage role="staff" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
