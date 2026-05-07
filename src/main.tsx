import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import "./index.css"
 import Dashboard from "./Admin-Dashboard"
// import Login from "./Login"
import POS from "./POS/POS"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import ManageMenuPage from "./POS/menuManagement"
import MainLayout from "@/mainLayout"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element = {<MainLayout />}>
              <Route index element={<POS />} />

              <Route path="/menuManagement" element={<ManageMenuPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)