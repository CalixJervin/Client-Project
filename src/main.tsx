import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"

import "./index.css"
// import Dashboard from "./Admin-Dashboard" // Keep this commented until you need it
import Login from "./Login/Login" // Make sure this matches your actual file path/name!
import POS from "./POS/POS"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import ManageMenuPage from "./POS/menuManagement"
import MainLayout from "@/mainLayout"

// --- SECURITY GUARD ---
// This checks if someone is logged in. If not, it kicks them to the login screen.
const ProtectedRoute = () => {
  const currentUser = localStorage.getItem("currentUser")
  
  // If there is no user in localStorage, redirect to /login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // If they are logged in, render the child routes (Outlet)
  return <Outlet />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            
            {/* PUBLIC ROUTE: The Login page sits OUTSIDE the MainLayout so it has no sidebar */}
            <Route path="/login" element={<Login />} />

            {/* PROTECTED ROUTES: Everything inside here requires a PIN first */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<POS />} />
                <Route path="/menuManagement" element={<ManageMenuPage />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)