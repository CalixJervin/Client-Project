import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/pos-sidebar"

export default function MainLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <Outlet /> 
      </SidebarInset>
    </SidebarProvider>
  )
}