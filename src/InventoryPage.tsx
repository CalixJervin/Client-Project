import { InventorySystem } from "@/components/inventory-system";
import { SiteHeader } from "@/components/site-header";

export default function InventoryPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto h-screen">
      <SiteHeader>
        <h1 className="text-base font-semibold">Inventory</h1>
      </SiteHeader>
      <div className="flex-1 overflow-auto">
        <InventorySystem />
      </div>
    </div>
  );
}
