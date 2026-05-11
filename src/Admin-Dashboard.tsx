import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { StaffManagement } from "@/components/staff-management"
import { useTransactions } from "./hooks/useTransactions"
import { useInventory } from "./context/InventoryContext"

export default function Page() {
  const { isLoading: txLoading } = useTransactions()
  const { isLoading: invLoading } = useInventory()

  if (txLoading || invLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <SiteHeader>
        <h1 className="text-base font-semibold">Dashboard</h1>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            
            <DataTable />

            <div className="px-4 lg:px-6">
              <StaffManagement />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
