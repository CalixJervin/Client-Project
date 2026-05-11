import * as React from "react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { AccountModal } from "@/Login/accountModal"
import { useState } from "react"
import { 
  Settings, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileChartColumn, 
  Database, 
  FileText, 
  CircleHelp, 
  Search,
  CommandIcon
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex h-16 flex-row items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
          <CommandIcon className="size-4" />
        </div>
        <span className="text-base font-bold tracking-tight">Timpla Cafe</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                <Link to="/" onClick={() => setOpenMobile(false)}>
                  <ShoppingCart className="size-4" />
                  <span>POS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {user?.role === "admin" && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === "/dashboard"}
                    tooltip="Dashboard"
                  >
                    <Link to="/dashboard" onClick={() => setOpenMobile(false)}>
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === "/inventory"}
                    tooltip="Inventory"
                  >
                    <Link to="/inventory" onClick={() => setOpenMobile(false)}>
                      <Package className="size-4" />
                      <span>Inventory</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === "/menuManagement"}
                tooltip="Edit Menu"
              >
                <Link to="/menuManagement" onClick={() => setOpenMobile(false)}>
                  <Settings className="size-4" />
                  <span>Edit Menu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser />
      </SidebarFooter>
      
      <SidebarRail />

      <AccountModal isOpen={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </Sidebar>
  )
}