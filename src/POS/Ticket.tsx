import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Minus, X } from "lucide-react"; // ADDED: X icon
import type { CartItem } from "@/hooks/useCart";
import { useTransactions } from "@/hooks/useTransactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/hooks/useInventory";

interface TicketSidebarProps {
  cart: CartItem[];
  updateQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  onClose?: () => void; // ADDED: Optional onClose prop
}

export function TicketSidebar({
  cart,
  updateQty,
  removeFromCart,
  clearCart,
  subtotal,
  total,
  onClose // ADDED: Destructure onClose
}: TicketSidebarProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState<number | "">("");
  
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash">("cash");
  const { saveTransaction } = useTransactions();
  const { processSale, products: inventoryProducts } = useInventory();

  const change = typeof amountReceived === "number" ? amountReceived - total : 0;
  
  const isSufficient = paymentMethod === "gcash" ? true : (typeof amountReceived === "number" && amountReceived >= total);

  const handleCompleteTransaction = () => {
    if (isSufficient) {
      // Auto-deduction logic
      cart.forEach(item => {
        // Try to find a matching product in inventory by name or ID
        const invProduct = inventoryProducts.find(p => p.name === item.name || p.id === String(item.id));
        if (invProduct) {
          processSale(invProduct.id, 0, item.qty);
        }
      });

      saveTransaction(cart, subtotal, paymentMethod);
      clearCart();
      setIsCheckoutOpen(false);
      setAmountReceived("");
      setPaymentMethod("cash"); 
      if (onClose) onClose();
    }
  };

  return (
    <div className="w-full sm:w-[350px] border-l bg-background flex flex-col h-full shadow-xl z-10 shrink-0">
      
      {/* UPDATED HEADER: Added the Mobile Close Button */}
      <div className="flex items-center justify-between p-4 border-b shrink-0 h-16">
        <div className="flex items-center gap-2">
          {/* Only shows on mobile screens when onClose is provided */}
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold text-lg">Current Order</h2>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearCart}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer"
        >
          Clear
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, x: 30, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: -30, height: 0, margin: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              <div className="flex justify-between font-medium pt-2">
                <span>{item.name}</span>
                <span>₱{(item.price * item.qty).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                <div className="flex items-center border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => updateQty(item.id, -1)}
                    className="h-8 w-8 rounded-none cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.qty}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => updateQty(item.id, 1)}
                    className="h-8 w-8 rounded-none cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeFromCart(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
            className="w-full font-bold text-lg h-12 cursor-pointer"
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

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setPaymentMethod("cash")}
                  className={`rounded-md cursor-pointer ${paymentMethod === "cash" ? "bg-background shadow-sm hover:bg-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Cash
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPaymentMethod("gcash")}
                  className={`rounded-md cursor-pointer ${paymentMethod === "gcash" ? "bg-[#007DFE] text-white hover:bg-[#007DFE]/90 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  GCash
                </Button>
              </div>
            </div>
            
            {paymentMethod === "cash" ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
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
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg flex flex-col items-center justify-center gap-2 border border-blue-200 dark:border-blue-900"
              >
                <span className="font-bold text-xl text-[#007DFE]">Exact Amount: ₱{total.toFixed(2)}</span>
                <span className="text-sm text-center text-muted-foreground">Please verify the GCash transfer on your device before confirming.</span>
              </motion.div>
            )}

          </div>
          <DialogFooter className="sm:justify-end">
            <Button 
              className="cursor-pointer"
              variant="outline" 
              onClick={() => {
                setIsCheckoutOpen(false);
                setAmountReceived("");
                setPaymentMethod("cash");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteTransaction}
              disabled={!isSufficient}
              className={paymentMethod === "gcash" ? "bg-[#007DFE] text-white hover:bg-[#007DFE]/90 cursor-pointer" : "cursor-pointer"}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}