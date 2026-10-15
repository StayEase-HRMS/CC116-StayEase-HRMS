import React, { useState, useEffect, useCallback } from 'react';
import { AdminSideBar } from "./components/sidebar";
import PageHeader from "./components/header";

import AdminTabPage from "./admin/Admin";

function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <PageHeader title="Admin dashboard" desc="lorem ipsum" />

        <div className="flex flex-1">
          <AdminSideBar />

          <main className="flex-1 min-w-0 overflow-y-auto">
            {/* page content */}
            <AdminTabPage />
          </main>
        </div>
      </div>
    </>
  )
}

export default App;