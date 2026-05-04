import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Minus } from "lucide-react";
import type { CartItem } from "@/hooks/useCart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TicketSidebarProps {
  cart: CartItem[];
  updateQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export function TicketSidebar({
  cart,
  updateQty,
  removeFromCart,
  clearCart,
  subtotal,
  tax,
  total
}: TicketSidebarProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState<number | "">("");

  const change = typeof amountReceived === "number" ? amountReceived - total : 0;
  const isSufficient = typeof amountReceived === "number" && amountReceived >= total;

  const handleCompleteTransaction = () => {
    if (isSufficient) {
      clearCart();
      setIsCheckoutOpen(false);
      setAmountReceived("");
    }
  };

  return (
    // CHANGED: Replaced fixed w-[350px] with w-full sm:w-[350px] so it adapts to mobile containers
    <div className="w-full sm:w-[350px] border-l bg-background flex flex-col h-full shadow-xl z-10 shrink-0">
      <div className="flex items-center justify-between p-4 border-b shrink-0 h-16">
        <h2 className="font-semibold text-lg">Current Order</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearCart}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          Clear
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex justify-between font-medium">
              <span>{item.name}</span>
              <span>₱{(item.price * item.qty).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => updateQty(item.id, -1)}
                  className="h-8 w-8 rounded-none"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.qty}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => updateQty(item.id, 1)}
                  className="h-8 w-8 rounded-none"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeFromCart(item.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-muted/5 shrink-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <Button 
            className="w-full font-bold text-lg h-12"
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
          >
            Charge ₱{total.toFixed(2)}
          </Button>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Due:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Amount Received (₱)</label>
              <Input 
                type="number" 
                autoFocus
                placeholder="0.00"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value ? Number(e.target.value) : "")}
                className="text-lg h-12"
              />
            </div>

            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground">Change:</span>
              <span className={`font-semibold ${change < 0 ? "text-destructive" : "text-green-600"}`}>
                ₱{Math.max(0, change).toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCheckoutOpen(false);
                setAmountReceived("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteTransaction}
              disabled={!isSufficient}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}