import { useState } from "react";
import type { Ingredient, IngredientUnit, RestockEntry } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  RefreshCw,
  FlaskConical,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

export type InventoryItem = {
  id: string;
  name: string;
  type: 'made-to-order' | 'ready-made'; // maps to Ingredient vs Ready-made Product
  currentStock: number;
  unit: string;
  lowStockThreshold: number;
  status: 'good' | 'low' | 'critical' | 'out';
  lastRestocked?: string;
  originalType: 'ingredient' | 'product';
};

interface InventoryTableProps {
  items: InventoryItem[];
  onRestockIngredient: (id: string, entry: Omit<RestockEntry, 'date'>) => void;
  onRestockProduct: (id: string, entry: Omit<RestockEntry, 'date'>) => void;
  onUpdateIngredient: (id: string, data: Partial<Ingredient>) => void;
  onDeleteIngredient: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddIngredient?: (data: Omit<Ingredient, 'id' | 'restockLog' | 'status'>) => void;
  showAddButton?: boolean;
}

export function InventoryTable({
  items,
  onRestockIngredient,
  onRestockProduct,
  onUpdateIngredient,
  onDeleteIngredient,
  onDeleteProduct,
  onAddIngredient,
  showAddButton
}: InventoryTableProps) {
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [restockQty, setRestockQty] = useState("");
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockNotes, setRestockNotes] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white border-none text-[10px] sm:text-xs">🟢 Good</Badge>;
      case "low":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-[10px] sm:text-xs">🟡 Low</Badge>;
      case "critical":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-[10px] sm:text-xs">🔴 Critical</Badge>;
      case "out":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none text-[10px] sm:text-xs">⚫ Out</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] sm:text-xs">{status}</Badge>;
    }
  };

  const handleRestockSubmit = () => {
    if (selectedItem && restockQty) {
      const entry = {
        quantityAdded: Number(restockQty),
        supplier: restockSupplier || undefined,
        notes: restockNotes || undefined,
      };

      if (selectedItem.originalType === 'ingredient') {
        onRestockIngredient(selectedItem.id, entry);
      } else {
        onRestockProduct(selectedItem.id, entry);
      }
      
      toast.success(`Restocked ${selectedItem.name}`);
      setIsRestockOpen(false);
      resetRestockForm();
    }
  };

  const resetRestockForm = () => {
    setRestockQty("");
    setRestockSupplier("");
    setRestockNotes("");
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      {showAddButton && (
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold md:hidden">Inventory</h3>
          <Button onClick={() => setIsAddOpen(true)} size="sm" className="sm:size-default">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Ingredient</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Current Stock</TableHead>
              <TableHead className="font-bold">Unit</TableHead>
              <TableHead className="font-bold">Threshold</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Last Restocked</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.type === 'made-to-order' ? (
                    <Badge variant="outline" className="gap-1 font-medium bg-blue-50 text-blue-700 border-blue-200">
                      <FlaskConical className="h-3 w-3" /> Made-to-order
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 font-medium bg-amber-50 text-amber-700 border-amber-200">
                      <Package className="h-3 w-3" /> Ready-made
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-lg">{item.currentStock}</TableCell>
                <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                <TableCell>{item.lowStockThreshold}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {item.lastRestocked 
                    ? format(new Date(item.lastRestocked), "MMM d, h:mm a") 
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsRestockOpen(true);
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Restock
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedItem(item);
                          setIsEditOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (item.originalType === 'ingredient') onDeleteIngredient(item.id);
                            else onDeleteProduct(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base">{item.name}</h4>
                  {item.type === 'made-to-order' ? (
                    <FlaskConical className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <Package className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {item.type.replace("-", " ")}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedItem(item);
                    setIsEditOpen(true);
                  }}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      if (item.originalType === 'ingredient') onDeleteIngredient(item.id);
                      else onDeleteProduct(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-end justify-between border-t pt-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Current Stock</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{item.currentStock}</span>
                  <span className="text-xs text-muted-foreground font-medium">{item.unit}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="h-9 gap-2 px-4 shadow-sm"
                onClick={() => {
                  setSelectedItem(item);
                  setIsRestockOpen(true);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Restock
              </Button>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-muted-foreground italic pt-1">
              <span>Threshold: {item.lowStockThreshold}</span>
              {item.lastRestocked && (
                <span>Last restocked: {format(new Date(item.lastRestocked), "MMM d, h:mm a")}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground text-sm">
          No items found.
        </div>
      )}

      {/* Restock Modal */}
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Item</p>
              <p className="text-lg font-bold">{selectedItem?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Current Stock: {selectedItem?.currentStock} {selectedItem?.unit}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Quantity to Add ({selectedItem?.unit})</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={restockQty} 
                onChange={(e) => setRestockQty(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Supplier (Optional)</label>
              <Input 
                placeholder="e.g. Local Farm" 
                value={restockSupplier} 
                onChange={(e) => setRestockSupplier(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input 
                placeholder="e.g. Bulk purchase" 
                value={restockNotes} 
                onChange={(e) => setRestockNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsRestockOpen(false)}>Cancel</Button>
            <Button className="flex-1 sm:flex-none" onClick={handleRestockSubmit} disabled={!restockQty || Number(restockQty) <= 0}>
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal (Ingredients Only for now via this table) */}
      <Dialog 
        open={isAddOpen || (isEditOpen && selectedItem?.originalType === 'ingredient')} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setIsEditOpen(false);
            setSelectedItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Edit Ingredient" : "Add New Ingredient"}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4 py-4" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get("name") as string,
              unit: formData.get("unit") as IngredientUnit,
              currentStock: Number(formData.get("currentStock")),
              lowStockThreshold: Number(formData.get("lowStockThreshold")),
              costPerUnit: formData.get("costPerUnit") ? Number(formData.get("costPerUnit")) : null,
              supplier: formData.get("supplier") as string || null,
            };

            if (isEditOpen && selectedItem) {
              onUpdateIngredient(selectedItem.id, data);
              toast.success("Ingredient updated");
            } else if (onAddIngredient) {
              onAddIngredient(data);
              toast.success("Ingredient added");
            }
            setIsAddOpen(false);
            setIsEditOpen(false);
            setSelectedItem(null);
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Name</label>
                <Input name="name" defaultValue={selectedItem?.name} placeholder="e.g. Espresso Beans" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Unit</label>
                <Select name="unit" defaultValue={selectedItem?.unit || "grams"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">Grams (g)</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="packs">Packs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Current Stock</label>
                <Input name="currentStock" type="number" defaultValue={selectedItem?.currentStock || 0} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Low Threshold</label>
                <Input name="lowStockThreshold" type="number" defaultValue={selectedItem?.lowStockThreshold || 100} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Cost per Unit</label>
                <Input name="costPerUnit" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Supplier</label>
                <Input name="supplier" placeholder="e.g. Nestle" />
              </div>
            </div>
            <DialogFooter className="mt-4 flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
                setSelectedItem(null);
              }}>Cancel</Button>
              <Button type="submit" className="flex-1 sm:flex-none">Save Ingredient</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
