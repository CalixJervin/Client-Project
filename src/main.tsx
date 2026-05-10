import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"

import "./index.css"
import Dashboard from "./Admin-Dashboard"
import Login from "./Login/Login"
import POS from "./POS/POS"
import InventoryPage from "./InventoryPage"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import ManageMenuPage from "./POS/menuManagement"
import MainLayout from "@/mainLayout"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { InventoryProvider } from "@/context/InventoryContext"

// --- SECURITY GUARD ---
const ProtectedRoute = () => {
  const { user, isLocked } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If the session is locked, we still want to be on the page but maybe show an overlay
  if (isLocked) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <InventoryProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<POS />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/menuManagement" element={<ManageMenuPage />} />
                  </Route>
                </Route>

              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </InventoryProvider>
    </AuthProvider>
  </StrictMode>
)
