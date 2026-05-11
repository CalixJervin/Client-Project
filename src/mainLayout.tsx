import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/pos-sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Toaster } from "sonner"

export default function MainLayout() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  return (
    <SidebarProvider defaultOpen={isAdmin}>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <Outlet /> 
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}