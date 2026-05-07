import { Outlet } from "react-router-dom"
// Make sure SidebarInset is imported here!
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/pos-sidebar" // Check your exact import path

export default function MainLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      {/* SidebarInset belongs here! Now EVERY page you make 
        will automatically have the correct layout and spacing. 
      */}
      <SidebarInset className="h-screen overflow-hidden">
        <Outlet /> 
      </SidebarInset>

    </SidebarProvider>
  )
}