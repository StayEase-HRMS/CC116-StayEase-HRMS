import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import AdminPage from "./admin/Admin";
import CustomerReservation from "./customer/CustomerReservation";
import LandingPage from "./LandingPage";
import CustomerChatSupport from "./customer/CustomerChatSupport";
import CustomerRooms from "./customer/CustomerRooms";
import CustomerPage from "./customer/CustomerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/*for testing, remove this later*/}
        <Route path="/customer" element={<CustomerPage />} /> 

        {/* Customer side routing*/}
        <Route path="/my-reservation" element={<CustomerPage />} />
        <Route path="/rooms" element={<CustomerPage />} />
        <Route path="/chat-support" element={<CustomerPage />} />

        {/* Admin/Staff side routing*/}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/reviews" element={<AdminPage />} />
        <Route path="/admin/reports" element={<AdminPage />} />
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



