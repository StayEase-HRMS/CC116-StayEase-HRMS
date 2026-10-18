import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import AdminPage from "./admin/Admin";
import CustomerDashboard from "./customer/CustomerReservation";
import LandingPage from "./LandingPage";
import CustomerChatSupport from "./customer/CustomerChatSupport";
import CustomerRooms from "./customer/CustomerRooms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-reservation" element={<CustomerDashboard />} />
        <Route path="/rooms" element={<CustomerRooms />} />
        <Route path="/chat-support" element={<CustomerChatSupport />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminPage />} />
        <Route path="/admin/rooms" element={<AdminPage />} />
        <Route path="/admin/reservations" element={<AdminPage />} />
        <Route path="/staff" element={<AdminPage role="staff" />} />
        <Route path="/staff/rooms" element={<AdminPage role="staff" />} />
        <Route path="/staff/reservations" element={<AdminPage role="staff" />} />
        <Route path="/staff/support" element={<AdminPage role="staff" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;



