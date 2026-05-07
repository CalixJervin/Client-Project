import { useState } from "react"
import { TicketSidebar } from "@/POS/Ticket"
import { useCart } from "@/hooks/useCart"
import { AddProductModal } from "@/POS/addProduct" 
import DeleteProductModal from "@/POS/deleteProduct"
import { AddCategoryModal } from "@/POS/addCategory"
import { ProductGrid } from "@/POS/items"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Plus, Search, X } from "lucide-react" // ADDED: Search and X icons
import { Button } from "@/components/ui/button" // ADDED: Button import
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
  
  // NEW: State to track if mobile search is expanded
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

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
    setProductToDelete(null);
  };

  const handleAddCategory = (newCategoryName: string, selectedProductIds: number[]) => {
    setCategories([...categories, newCategoryName])

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

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const totalCartItems = cart.reduce((total, item) => total + item.qty, 0);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setSelectedProductId(product.id);
    
    // Optional: Reset the selection after a short delay
    setTimeout(() => {
      setSelectedProductId(null);
    }, 150); 
  };
    
  return (
    <div className="flex flex-row h-full">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* REPLACED HEADER: Now supports mobile expanding search! */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
          
          {/* LEFT SIDE (Sidebar Trigger & Ticket Breadcrumb) */}
          <div className={`items-center gap-2 ${isMobileSearchOpen ? "hidden md:flex" : "flex"}`}>
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div 
              className="cursor-pointer lg:cursor-default flex items-center"
              onClick={() => setIsMobileTicketOpen(true)}
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2">
                      Ticket 
                      {totalCartItems > 0 && (
                        <span className="lg:hidden bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          {totalCartItems}
                        </span>
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* RIGHT SIDE (Search Bar & Icons) */}
          <div className={`flex items-center ${isMobileSearchOpen ? "w-full md:w-auto" : "ml-auto pl-4"}`}>
            
            {/* Mobile View: Show Magnifying Glass when closed */}
            {!isMobileSearchOpen && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}

            {/* The Search Input: Visible on desktop, or visible on mobile when 'opened' */}
            <div className={`${isMobileSearchOpen ? "flex w-full animate-in fade-in slide-in-from-right-4" : "hidden md:flex"} items-center gap-2 ml-auto`}>
              <Input 
                type="search" 
                placeholder="Search items..." 
                className="h-8 md:h-9 bg-muted w-full md:w-[200px] lg:w-[250px]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isMobileSearchOpen}
              />
              
              {/* Mobile View: Show 'X' button to close search */}
              {isMobileSearchOpen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden shrink-0"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
          <div className="flex w-full overflow-x-auto pb-2 gap-2 scrollbar-hide shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-foreground text-background" // Uses the absolute darkest theme color (black in light mode)
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
            
            <button 
              onClick={() => setIsAddCategoryOpen(true)}
              className="flex items-center gap-1 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          <ProductGrid 
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            selectedProductId={selectedProductId}
            onDeleteProduct={handleStageForDeletion}
            onAddNewClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

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

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
        onAddProduct={handleProductAdded}
        categories={categories}
      />
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
    </div>
  )
}