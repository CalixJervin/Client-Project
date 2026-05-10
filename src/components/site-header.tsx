import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 sticky top-0 z-20">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {/* We use justify-between so the Ticket sits on the left, and Search sits on the right */}
        <div className="flex flex-1 items-center justify-between">
          {children}

          {/* TEMPORARILY HIDDEN: Dashboard & POS Toggle Options */}
          {/* 
          <div className="flex items-center gap-4">
            {user?.role === "admin" && (
              <div className="flex bg-muted p-0.5 rounded-lg border">
                ... toggle buttons ...
              </div>
            )}
            <div className="text-sm font-medium hidden lg:block opacity-70">
              {user?.name}
            </div>
          </div> 
          */}
        </div>
      </div>
    </header>
  )
}