import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
 import Dashboard from "./Admin-Dashboard"
// import Login from "./Login"
import POS from "./POS/POS"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <POS />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)