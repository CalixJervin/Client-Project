import { StrictMode, lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import MainLayout from "@/mainLayout"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { InventoryProvider } from "@/context/InventoryContext"

const Dashboard = lazy(() => import("./Admin-Dashboard"))
const Login = lazy(() => import("./Login/Login"))
const POS = lazy(() => import("./POS/POS"))
const InventoryPage = lazy(() => import("./InventoryPage"))
const ManageMenuPage = lazy(() => import("./POS/menuManagement"))

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
              <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </InventoryProvider>
    </AuthProvider>
  </StrictMode>
)
