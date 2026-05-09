import * as React from "react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { AccountModal } from "@/Login/accountModal"
import { useState } from "react"
import { Settings, LogOut, LayoutDashboard, ShoppingCart, Users } from "lucide-react"
import { CommandIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const { user, logout, switchUser } = useAuth()
  const navigate = useNavigate()

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
              <SidebarMenuButton asChild>
                <Link to="/" onClick={() => setOpenMobile(false)}>
                  <ShoppingCart className="size-4" />
                  <span>POS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {user?.role === "admin" && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard" onClick={() => setOpenMobile(false)}>
                    <LayoutDashboard className="size-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            
            <SidebarRail />
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
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