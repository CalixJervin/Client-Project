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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <NavUser user={data.user} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            
            {/* FIXED: SidebarMenuButton now directly wraps the Link */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <span>POS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {/* Keeping your rail/separator if you want it between items */}
            <SidebarRail />
            
            {/* FIXED: SidebarMenuButton now directly wraps the Link */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/menuManagement">
                  <span>Edit Menu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border"></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}