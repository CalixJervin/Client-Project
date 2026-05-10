import { useState, useEffect } from "react";
import type { CartItem } from "./useCart";

export interface Transaction {
  id: string;
  order_id: string; // Short readable ID like #ORD-1042
  total_amount: number;
  payment_method: "cash" | "gcash";
  timestamp: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem("timpla_transactions");
    const savedItems = localStorage.getItem("timpla_transaction_items");
    
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      // Filter out legacy transactions without order_id
      const valid = parsed.filter((t: any) => t.order_id);
      setTransactions(valid);
      
      // Sync back if legacy data was removed
      if (valid.length !== parsed.length) {
        localStorage.setItem("timpla_transactions", JSON.stringify(valid));
      }
    }
    if (savedItems) setTransactionItems(JSON.parse(savedItems));
  }, []);

  const saveTransaction = (cart: CartItem[], total: number, paymentMethod: "cash" | "gcash") => {
    const transactionId = crypto.randomUUID();
    // Generate a shorter, readable order ID for the UI
    const orderNum = Math.floor(Math.random() * 9000) + 1000;
    const orderId = `#ORD-${orderNum}`;

    const newTransaction: Transaction = {
      id: transactionId,
      order_id: orderId,
      total_amount: total,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString(),
    };

    const newItems: TransactionItem[] = cart.map((item) => ({
      id: crypto.randomUUID(),
      transaction_id: transactionId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
    }));

    const updatedTransactions = [newTransaction, ...transactions];
    const updatedItems = [...newItems, ...transactionItems];

    setTransactions(updatedTransactions);
    setTransactionItems(updatedItems);

    localStorage.setItem("timpla_transactions", JSON.stringify(updatedTransactions));
    localStorage.setItem("timpla_transaction_items", JSON.stringify(updatedItems));
  };

  const clearTransactions = () => {
    setTransactions([]);
    setTransactionItems([]);
    localStorage.removeItem("timpla_transactions");
    localStorage.removeItem("timpla_transaction_items");
  };

  const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalOrders = transactions.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const itemsSold = transactionItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    transactions,
    transactionItems,
    saveTransaction,
    clearTransactions,
    metrics: {
      totalSales,
      totalOrders,
      averageOrderValue,
      itemsSold,
    },
  };
}
