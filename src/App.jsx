import React, { useState, useEffect, useCallback } from 'react';
import { AdminSideBar } from "./components/sidebar";
import PageHeader from "./components/header";

function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <PageHeader title="Admin dashboard" desc="lorem ipsum" />

        <div className="flex flex-1">
          <AdminSideBar />

          <main className="min-w-0 flex-1 p-6">
            {/* page content */}
          </main>
        </div>
      </div>
    </>
  )
}

export default App;