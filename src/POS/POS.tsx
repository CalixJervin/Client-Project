import { useState } from "react"
import { AppSidebar } from "@/components/pos-sidebar"
import { TicketSidebar } from "@/POS/Ticket"
import { useCart } from "@/hooks/useCart"
import { AddProductModal } from "@/POS/addProduct" 
import  DeleteProductModal  from "@/POS/deleteProduct"
import { AddCategoryModal } from "@/POS/addCategory"
import { ProductGrid } from "@/POS/items"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { mockProducts as initialProducts } from "@/POS/products"
import type { Product } from "@/hooks/useCart"
import { Toaster } from "@/components/ui/sonner"


export default function Page() {
  const { 
    cart, addToCart, updateQty, removeFromCart, 
    clearCart, subtotal, tax, total 
  } = useCart()

  const [isMobileTicketOpen, setIsMobileTicketOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [categories, setCategories] = useState([
    "All", "Hot Coffee", "Iced Coffee", "Milk Tea", "Fruit Tea", "Pastries"
  ])
  const [activeCategory, setActiveCategory] = useState("All")
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // NEW: A clean handler that just takes the finished product from the modal
  const handleProductAdded = (newProduct: Product) => {
    setProducts([...products, newProduct])
  }

  const handleStageForDeletion = (id: number, name: string) => {
    const product = products.find(p => p.id === id) || null;
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (id: number) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
    setProductToDelete(null); // Clean up the state after deleting
  };

  const handleAddCategory = (newCategoryName: string, selectedProductIds: number[]) => {
    // Add the new category to our list
    setCategories([...categories, newCategoryName])

    // If they selected products, update those products to the new category
    if (selectedProductIds.length > 0) {
      setProducts(products.map(product => 
        selectedProductIds.includes(product.id) 
          ? { ...product, category: newCategoryName } 
          : product
      ))
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

    
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden flex flex-row">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* --- HEADER --- */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
            <div 
              className="flex items-center gap-2 cursor-pointer lg:cursor-default"
              onClick={() => setIsMobileTicketOpen(true)}
            >
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2">
                      Ticket 
                      {cart.length > 0 && (
                        <span className="lg:hidden bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          {cart.length}
                        </span>
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="w-full max-w-[200px] md:max-w-xs ml-auto pl-4">
              <Input 
                type="search" 
                placeholder="Search items..." 
                className="h-8 md:h-9 bg-muted" 
                // CHANGED: Bind the input to the state
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
            {/* CATEGORIES */}
            <div className="flex w-full overflow-x-auto pb-2 gap-2 scrollbar-hide shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
            
            {/* 4. Connect the Add Category button */}
            <button 
              onClick={() => setIsAddCategoryOpen(true)}
              className="flex items-center gap-1 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

            {/* PRODUCT GRID */}
            <ProductGrid 
              products={filteredProducts}
              onAddToCart={addToCart}
              onDeleteProduct={handleStageForDeletion}
              onAddNewClick={() => setIsAddModalOpen(true)}
            />
          </div>
        </div>

        {/* --- DESKTOP SIDEBAR --- */}
        <div className="hidden lg:block h-full">
          <TicketSidebar 
            cart={cart}
            updateQty={updateQty}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </div>

        {/* --- MOBILE SIDEBAR OVERLAY --- */}
        {isMobileTicketOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div 
              className="fixed inset-0 bg-black/60 transition-opacity" 
              onClick={() => setIsMobileTicketOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-[85%] sm:w-[350px] bg-background shadow-2xl animate-in slide-in-from-right overflow-hidden flex flex-col">
              <TicketSidebar 
                cart={cart}
                updateQty={updateQty}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                subtotal={subtotal}
                tax={tax}
                total={total}
              />
            </div>
          </div>
        )}
      </SidebarInset>

      {/* NEW: The extracted Add Product Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
        onAddProduct={handleProductAdded}
        categories={categories}
      />
      {/* NEW: Drop your delete modal here */}
      <DeleteProductModal 
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDeleteProduct={handleConfirmDelete}
        product={productToDelete}
      />
      <AddCategoryModal 
        isOpen={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onAddCategory={handleAddCategory}
        existingProducts={products}
        existingCategories={categories}
      />

      <Toaster richColors/>
    </SidebarProvider>
  )
}