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
  History, 
  MoreVertical, 
  Edit, 
  Trash2, 
  RefreshCw 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

interface IngredientsTableProps {
  ingredients: Ingredient[];
  onRestock: (id: string, entry: Omit<RestockEntry, 'date'>) => void;
  onUpdate: (id: string, data: Partial<Ingredient>) => void;
  onDelete: (id: string) => void;
  onAdd?: (data: Omit<Ingredient, 'id' | 'restockLog' | 'status'>) => void;
  showAddButton?: boolean;
}

export function IngredientsTable({
  ingredients,
  onRestock,
  onUpdate,
  onDelete,
  onAdd,
  showAddButton
}: IngredientsTableProps) {
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Form states
  const [restockQty, setRestockQty] = useState("");
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockNotes, setRestockNotes] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">🟢 Good</Badge>;
      case "low":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">🟡 Low</Badge>;
      case "critical":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none">🔴 Critical</Badge>;
      case "out":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none">⚫ Out</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRestockSubmit = () => {
    if (selectedIngredient && restockQty) {
      onRestock(selectedIngredient.id, {
        quantityAdded: Number(restockQty),
        supplier: restockSupplier || undefined,
        notes: restockNotes || undefined,
      });
      toast.success(`Restocked ${selectedIngredient.name}`);
      setIsRestockOpen(false);
      resetRestockForm();
    }
  };

  const resetRestockForm = () => {
    setRestockQty("");
    setRestockSupplier("");
    setRestockNotes("");
    setSelectedIngredient(null);
  };

  return (
    <div className="space-y-4">
      {showAddButton && (
        <div className="flex justify-end">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Current Stock</TableHead>
              <TableHead className="font-bold">Unit</TableHead>
              <TableHead className="font-bold">Threshold</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Last Restocked</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ing) => (
              <TableRow key={ing.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{ing.name}</TableCell>
                <TableCell className="font-bold text-lg">{ing.currentStock}</TableCell>
                <TableCell className="text-muted-foreground">{ing.unit}</TableCell>
                <TableCell>{ing.lowStockThreshold}</TableCell>
                <TableCell>{getStatusBadge(ing.status)}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {ing.restockLog.length > 0 
                    ? format(new Date(ing.restockLog[0].date), "MMM d, h:mm a") 
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => {
                        setSelectedIngredient(ing);
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
                          setSelectedIngredient(ing);
                          setIsEditOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(ing.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ingredients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No ingredients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Restock Modal */}
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Ingredient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Ingredient</p>
              <p className="text-lg font-bold">{selectedIngredient?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Current Stock: {selectedIngredient?.currentStock} {selectedIngredient?.unit}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Quantity to Add ({selectedIngredient?.unit})</label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockOpen(false)}>Cancel</Button>
            <Button onClick={handleRestockSubmit} disabled={!restockQty || Number(restockQty) <= 0}>
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog 
        open={isAddOpen || isEditOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setIsEditOpen(false);
            setSelectedIngredient(null);
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

            if (isEditOpen && selectedIngredient) {
              onUpdate(selectedIngredient.id, data);
              toast.success("Ingredient updated");
            } else if (onAdd) {
              onAdd(data);
              toast.success("Ingredient added");
            }
            setIsAddOpen(false);
            setIsEditOpen(false);
            setSelectedIngredient(null);
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Name</label>
                <Input name="name" defaultValue={selectedIngredient?.name} placeholder="e.g. Espresso Beans" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Unit</label>
                <Select name="unit" defaultValue={selectedIngredient?.unit || "grams"}>
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
                <Input name="currentStock" type="number" defaultValue={selectedIngredient?.currentStock || 0} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Low Threshold</label>
                <Input name="lowStockThreshold" type="number" defaultValue={selectedIngredient?.lowStockThreshold || 100} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Cost per Unit</label>
                <Input name="costPerUnit" type="number" step="0.01" defaultValue={selectedIngredient?.costPerUnit || ""} placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Supplier</label>
                <Input name="supplier" defaultValue={selectedIngredient?.supplier || ""} placeholder="e.g. Nestle" />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
                setSelectedIngredient(null);
              }}>Cancel</Button>
              <Button type="submit">Save Ingredient</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
