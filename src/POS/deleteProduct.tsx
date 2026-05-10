import { toast } from "sonner";
import type { Product } from "@/hooks/useCart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteProduct: (id: string) => void;
  product: Product | null;
}

export default function DeleteProductModal({ 
    isOpen, 
    onOpenChange, 
    onDeleteProduct, 
    product }: DeleteProductModalProps) {

const handleDeleteitem = () => {
    if (!product) return;

    onDeleteProduct(product!.id);

    toast.success(`Deleted ${product.name}`, {
    description: `Category: ${product.category} | Price: ₱${product.price}`,
    });
    onOpenChange(false);
}
        return(
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete <strong>{product?.name}</strong>?</p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteitem}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

