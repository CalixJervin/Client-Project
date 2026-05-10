import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useInventory } from "@/hooks/useInventory";
import { AddProductWizard } from "@/components/inventory/AddProductWizard";

interface AddProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (productData: any) => void;
}

export function AddProductModal({
  isOpen,
  onOpenChange,
  onAddProduct,
}: AddProductModalProps) {
  const { ingredients, recipes, addRecipe } = useInventory();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <AddProductWizard 
          ingredients={ingredients}
          recipes={recipes}
          onComplete={(productData) => {
            onAddProduct(productData);
            onOpenChange(false);
          }}
          onAddRecipe={addRecipe}
        />
      </DialogContent>
    </Dialog>
  );
}
