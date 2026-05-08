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
import { Link } from "react-router-dom"
import { AccountModal } from "@/Login/accountModal"
import { useState } from "react"
import { Settings, LogOut } from "lucide-react"
import { CommandIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const [isAccountOpen, setIsAccountOpen] = useState(false)

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
                  <span>POS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarRail />
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/menuManagement" onClick={() => setOpenMobile(false)}>
                  <span>Edit Menu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* NEW: Populated SidebarFooter with Settings and Logout */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setIsAccountOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link 
                to="/login" 
                onClick={() => {
                  localStorage.removeItem("currentUser") // Clear the session
                  setOpenMobile(false) // Close the mobile sidebar
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive font-medium">Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />

      {/* NEW: The Account Settings Modal */}
      <AccountModal isOpen={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </Sidebar>
  )
}