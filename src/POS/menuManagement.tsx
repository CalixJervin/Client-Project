import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Edit, Plus, Trash2, Search, X } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster, toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

// Import your Modals and Types
import { mockProducts } from "@/POS/products" 
import type { Product } from "@/hooks/useCart"
import { AddProductModal } from "@/POS/addProduct"
import { EditProductModal } from "@/POS/editProduct"
import DeleteProductModal from "@/POS/deleteProduct"
import { AddCategoryModal } from "@/POS/addCategory"

export default function ManageMenuPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categories, setCategories] = useState(["Hot Coffee", "Iced Coffee", "Milk Tea", "Fruit Tea", "Pastries"])
  const [searchQuery, setSearchQuery] = useState("")

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("products")

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([])

  // NEW: Ref to track the long-press timer
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- MODAL STATES ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // --- SELECTION HANDLERS ---
  const toggleProduct = (id: number) => {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const toggleAllProducts = (checked: boolean) => {
    setSelectedProductIds(checked ? filteredProducts.map(p => p.id) : [])
  }

  const toggleCategory = (name: string) => {
    setSelectedCategoryNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }
  const toggleAllCategories = (checked: boolean) => {
    setSelectedCategoryNames(checked ? categories : [])
  }

  // NEW: Long Press Handlers
  const cancelPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  // --- BULK ACTION HANDLERS ---
  const handleBulkDelete = () => {
    if (activeTab === "products") {
      if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) {
        setProducts(products.filter(p => !selectedProductIds.includes(p.id)));
        setSelectedProductIds([]);
        toast.success("Products deleted.");
      }
    } else {
      if (window.confirm(`Are you sure you want to delete ${selectedCategoryNames.length} categories? Products inside will be moved to "Uncategorized".`)) {
        let updatedCategories = categories.filter(c => !selectedCategoryNames.includes(c));
        setProducts(products.map(p => selectedCategoryNames.includes(p.category) ? { ...p, category: "Uncategorized" } : p));
        if (!updatedCategories.includes("Uncategorized")) updatedCategories.push("Uncategorized");
        setCategories(updatedCategories);
        setSelectedCategoryNames([]);
        toast.success("Categories deleted.");
      }
    }
  }

  const handleBulkEdit = () => {
    if (activeTab === "products" && selectedProductIds.length === 1) {
      const product = products.find(p => p.id === selectedProductIds[0]);
      if (product) {
        setSelectedProduct(product);
        setIsEditProductOpen(true);
      }
    } else if (activeTab === "categories" && selectedCategoryNames.length === 1) {
      const cat = selectedCategoryNames[0];
      setSelectedCategory(cat);
      setNewCategoryName(cat);
      setIsEditCategoryOpen(true);
    }
  }

  // --- STANDARD HANDLERS ---
  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct])
    toast.success(`${newProduct.name} added!`)
  }
  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
    setSelectedProductIds([]);
    toast.success(`${updatedProduct.name} updated!`)
  }
  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id))
    toast.success("Product deleted.")
  }

  const handleAddCategory = (newCategory: string, selectedProductIds: number[]) => {
    setCategories([...categories, newCategory])
    if (selectedProductIds.length > 0) {
      setProducts(products.map(p => selectedProductIds.includes(p.id) ? { ...p, category: newCategory } : p))
    }
    toast.success(`${newCategory} created!`)
  }
  
  const handleSaveCategoryEdit = () => {
    if (!newCategoryName || newCategoryName === selectedCategory) {
      setIsEditCategoryOpen(false);
      return;
    }
    setCategories(categories.map(c => c === selectedCategory ? newCategoryName : c))
    setProducts(products.map(p => p.category === selectedCategory ? { ...p, category: newCategoryName } : p))
    setIsEditCategoryOpen(false)
    setSelectedCategoryNames([]);
    toast.success("Category renamed!")
  }

  const handleConfirmCategoryDelete = () => {
    let updatedCategories = categories.filter(c => c !== selectedCategory);
    setProducts(products.map(p => p.category === selectedCategory ? { ...p, category: "Uncategorized" } : p))
    if (!updatedCategories.includes("Uncategorized")) updatedCategories.push("Uncategorized");
    setCategories(updatedCategories)
    setIsDeleteCategoryOpen(false)
    toast.success("Category deleted.")
  }

  const showBottomBar = (activeTab === "products" && selectedProductIds.length > 0) || 
                        (activeTab === "categories" && selectedCategoryNames.length > 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
      
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
        <div className={`items-center gap-2 ${isMobileSearchOpen ? "hidden md:flex" : "flex"}`}>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">POS</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Menu Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className={`flex items-center ${isMobileSearchOpen ? "w-full md:w-auto" : "ml-auto pl-4"}`}>
          {!isMobileSearchOpen && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileSearchOpen(true)}>
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}

          <div className={`${isMobileSearchOpen ? "flex w-full animate-in fade-in slide-in-from-right-4" : "hidden md:flex"} items-center gap-2 ml-auto`}>
            <Input 
              type="search" placeholder="Search items..." className="h-8 md:h-9 bg-muted w-full md:w-[200px] lg:w-[250px]" 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus={isMobileSearchOpen}
            />
            {isMobileSearchOpen && (
              <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(""); }}>
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24"> 
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
          
          <TabsList className="w-full grid grid-cols-2 h-14 bg-muted/80 p-1 rounded-xl mb-2 shadow-inner border border-border/50">
            <TabsTrigger value="products" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">Products</TabsTrigger>
            <TabsTrigger value="categories" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">Categories</TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB CONTENT */}
          <TabsContent value="products" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2">
            
            <div className="grid grid-cols-2 mb-6">
              <div className="flex justify-center px-1 sm:px-0">
                <Button 
                  onClick={() => setIsAddProductOpen(true)} 
                  className="w-[95%] sm:w-[70%] max-w-[220px] rounded-full bg-foreground text-background hover:bg-foreground/80 shadow-md font-semibold whitespace-nowrap"
                >
                  <Plus className="mr-1 sm:mr-2 h-4 w-4 shrink-0" /> Add Product
                </Button>
              </div>
              <div></div> 
            </div>

            <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {/* CHANGED: Hidden on mobile unless selection mode is active */}
                    <TableHead className={`w-[40px] text-center transition-all ${selectedProductIds.length > 0 ? "table-cell" : "hidden md:table-cell"}`}>
                      <input 
                        type="checkbox" 
                        className="accent-primary h-4 w-4 rounded cursor-pointer"
                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={(e) => toggleAllProducts(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right w-[120px] hidden md:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className={`transition-colors cursor-pointer md:cursor-default ${selectedProductIds.includes(product.id) ? "bg-muted/30" : ""}`}
                      
                      // NEW: Touch Handlers for Long Press
                      onTouchStart={() => {
                        if (selectedProductIds.length === 0) {
                          pressTimer.current = setTimeout(() => {
                            toggleProduct(product.id)
                            // Optional: Small haptic vibration to confirm hold
                            if (window.navigator?.vibrate) window.navigator.vibrate(50)
                          }, 450) // 450ms hold time
                        }
                      }}
                      onTouchEnd={cancelPressTimer}
                      onTouchMove={cancelPressTimer}
                      
                      // NEW: Standard click selection once mode is active
                      onClick={() => {
                        if (selectedProductIds.length > 0) toggleProduct(product.id)
                      }}
                    >
                      {/* CHANGED: Hidden on mobile unless selection mode is active */}
                      <TableCell className={`text-center transition-all ${selectedProductIds.length > 0 ? "table-cell" : "hidden md:table-cell"}`}>
                        <input 
                          type="checkbox" 
                          className="accent-primary h-4 w-4 rounded cursor-pointer"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          onClick={(e) => e.stopPropagation()} // Prevents double-toggling
                        />
                      </TableCell>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover pointer-events-none" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell><span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">{product.category}</span></TableCell>
                      <TableCell className="text-right font-medium">₱{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsEditProductOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsDeleteProductOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* CATEGORIES TAB CONTENT */}
          <TabsContent value="categories" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2">
            
            <div className="grid grid-cols-2 mb-6">
              <div></div> 
              <div className="flex justify-center px-1 sm:px-0">
                <Button 
                  onClick={() => setIsAddCategoryOpen(true)} 
                  className="w-[95%] sm:w-[70%] max-w-[220px] rounded-full bg-foreground text-background hover:bg-foreground/80 shadow-md font-semibold whitespace-nowrap"
                >
                  <Plus className="mr-1 sm:mr-2 h-4 w-4 shrink-0" /> Add Category
                </Button>
              </div>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {/* CHANGED: Hidden on mobile unless selection mode is active */}
                    <TableHead className={`w-[40px] text-center transition-all ${selectedCategoryNames.length > 0 ? "table-cell" : "hidden md:table-cell"}`}>
                      <input 
                        type="checkbox" 
                        className="accent-primary h-4 w-4 rounded cursor-pointer"
                        checked={selectedCategoryNames.length === categories.length && categories.length > 0}
                        onChange={(e) => toggleAllCategories(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Total Items</TableHead>
                    <TableHead className="text-right w-[120px] hidden md:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const itemCount = products.filter(p => p.category === category).length;
                    return (
                      <TableRow 
                        key={category} 
                        className={`transition-colors cursor-pointer md:cursor-default ${selectedCategoryNames.includes(category) ? "bg-muted/30" : ""}`}
                        
                        // NEW: Touch Handlers for Long Press
                        onTouchStart={() => {
                          if (selectedCategoryNames.length === 0) {
                            pressTimer.current = setTimeout(() => {
                              toggleCategory(category)
                              if (window.navigator?.vibrate) window.navigator.vibrate(50)
                            }, 450)
                          }
                        }}
                        onTouchEnd={cancelPressTimer}
                        onTouchMove={cancelPressTimer}
                        
                        // NEW: Standard click selection once mode is active
                        onClick={() => {
                          if (selectedCategoryNames.length > 0) toggleCategory(category)
                        }}
                      >
                        {/* CHANGED: Hidden on mobile unless selection mode is active */}
                        <TableCell className={`text-center transition-all ${selectedCategoryNames.length > 0 ? "table-cell" : "hidden md:table-cell"}`}>
                          <input 
                            type="checkbox" 
                            className="accent-primary h-4 w-4 rounded cursor-pointer"
                            checked={selectedCategoryNames.includes(category)}
                            onChange={() => toggleCategory(category)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{itemCount} items</TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); setNewCategoryName(category); setIsEditCategoryOpen(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); setIsDeleteCategoryOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- MOBILE FLOATING ACTION BAR --- */}
      <AnimatePresence>
        {showBottomBar && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-10px_20px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center md:hidden"
          >
            <div className="flex flex-col">
              <span className="font-bold text-sm">
                {activeTab === "products" ? selectedProductIds.length : selectedCategoryNames.length} Selected
              </span>
              <button 
                onClick={() => activeTab === "products" ? setSelectedProductIds([]) : setSelectedCategoryNames([])}
                className="text-xs text-muted-foreground underline text-left"
              >
                Clear Selection
              </button>
            </div>
            
            <div className="flex gap-2">
              {(activeTab === "products" ? selectedProductIds.length === 1 : selectedCategoryNames.length === 1) && (
                <Button variant="outline" onClick={handleBulkEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AddProductModal isOpen={isAddProductOpen} onOpenChange={setIsAddProductOpen} onAddProduct={handleAddProduct} categories={categories} />
      <EditProductModal isOpen={isEditProductOpen} onOpenChange={setIsEditProductOpen} product={selectedProduct} categories={categories} onSave={handleEditProduct} />
      <DeleteProductModal isOpen={isDeleteProductOpen} onOpenChange={setIsDeleteProductOpen} product={selectedProduct} onDeleteProduct={handleDeleteProduct} />
      <AddCategoryModal isOpen={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen} onAddCategory={handleAddCategory} existingProducts={products} existingCategories={categories} />

      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Rename Category</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategoryEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
          <DialogDescription className="py-4">
            Are you sure you want to delete <strong>{selectedCategory}</strong>? Any products inside will be moved to "Uncategorized".
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCategoryOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmCategoryDelete}>Delete Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors />
    </div>
  )
}