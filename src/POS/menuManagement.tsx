import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Edit, Plus, Trash2, Search, X } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Toaster, toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "@/components/site-header"

// Import your Modals and Types
import { AddProductModal } from "@/POS/addProduct"
import { EditProductModal } from "@/POS/editProduct"
import DeleteProductModal from "@/POS/deleteProduct"
import { AddCategoryModal } from "@/POS/addCategory"

import { useInventory } from "@/hooks/useInventory"
import { generateId } from "@/lib/utils"

export default function ManageMenuPage() {
  const { 
    products: inventoryProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    categories,
    addCategory,
    deleteCategory
  } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("products")

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([])

  // Ref to track the long-press timer
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- MODAL STATES ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false)
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")

  // Map inventory products to POS structure for filtered display if needed, 
  // but here we can just use inventoryProducts directly for management.
  const filteredProducts = inventoryProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // --- SELECTION HANDLERS ---
  const toggleProduct = (id: string) => {
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

  // Long Press Handlers
  const cancelPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  // --- BULK ACTION HANDLERS ---
  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  }

  const handleConfirmBulkDelete = async () => {
    try {
      if (activeTab === "products") {
        await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
        setSelectedProductIds([]);
      } else {
        const updates = inventoryProducts
          .filter(p => selectedCategoryNames.includes(p.category))
          .map(p => updateProduct(p.id, { category: "Uncategorized" as any }));

        await Promise.all(updates);

        selectedCategoryNames.forEach(name => deleteCategory(name));
        
        setSelectedCategoryNames([]);
        toast.success(`${selectedCategoryNames.length} categories deleted.`);
      }
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  }
  const handleBulkEdit = () => {
    if (activeTab === "products" && selectedProductIds.length === 1) {
      const product = inventoryProducts.find(p => p.id === selectedProductIds[0]);
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
  const handleAddProduct = async (productData: any) => {
    await addProduct(productData)
  }
  const handleEditProduct = async (updatedProduct: any) => {
    await updateProduct(updatedProduct.id, {
      ...updatedProduct,
      variants: [{ 
        id: generateId(), 
        size: 'Regular', 
        price: updatedProduct.price, 
        recipeId: updatedProduct.recipeId 
      }]
    })
    setSelectedProductIds([]);
  }
  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id)
  }

  const handleAddCategory = async (newCategory: string, selectedIds: any[]) => {
    addCategory(newCategory)
    if (selectedIds.length > 0) {
      await Promise.all(selectedIds.map(id => updateProduct(id, { category: newCategory as any })))
    }
    toast.success(`${newCategory} created!`)
  }
  
  const handleSaveCategoryEdit = async () => {
    if (!newCategoryName || newCategoryName === selectedCategory) {
      setIsEditCategoryOpen(false);
      return;
    }
    
    // Rename logic
    deleteCategory(selectedCategory);
    addCategory(newCategoryName);
    
    const updates = inventoryProducts
      .filter(p => p.category === selectedCategory)
      .map(p => updateProduct(p.id, { category: newCategoryName as any }));
    
    await Promise.all(updates);
    
    setIsEditCategoryOpen(false)
    setSelectedCategoryNames([]);
    toast.success("Category renamed!")
  }

  const handleConfirmCategoryDelete = async () => {
    const updates = inventoryProducts
      .filter(p => p.category === selectedCategory)
      .map(p => updateProduct(p.id, { category: "Uncategorized" as any }));
    
    await Promise.all(updates);
    
    deleteCategory(selectedCategory);
    setIsDeleteCategoryOpen(false)
    toast.success("Category deleted.")
  }

  const showBottomBar = (activeTab === "products" && selectedProductIds.length > 0) || 
                        (activeTab === "categories" && selectedCategoryNames.length > 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#EDE5DA] relative">
      
      <div className="bg-[#E8DFD3] border-b border-[#D4C9BB]">
        <SiteHeader>
          {/* --- LEFT SIDE: Breadcrumbs --- */}
          <div className="flex items-center gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/" className="text-[#6B5B4E]">POS</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[#D4C9BB]" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base font-bold text-[#1C1412]">Menu Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* --- RIGHT SIDE: Search Bar --- */}
          <div className={`flex items-center ${isMobileSearchOpen ? "w-full md:w-auto" : "ml-auto"}`}>
            {!isMobileSearchOpen && (
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 cursor-pointer" onClick={() => setIsMobileSearchOpen(true)}>
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}

            <div className={`${isMobileSearchOpen ? "flex fixed inset-x-0 top-0 z-50 bg-background h-16 items-center px-4" : "hidden md:flex"} items-center gap-2`}>
              <div className="relative">
                <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-[#9E8E7E] pointer-events-none" />
                <Input 
                  type="search" 
                  placeholder="Search items..." 
                  className="h-11 bg-[#DDD5C8] w-full md:w-[200px] lg:w-[250px] pl-9 rounded-full border-[#C4B5A5] text-[#2C1F17] placeholder:text-[#9E8E7E] focus-visible:ring-1 focus-visible:ring-[#C4B5A5] touch-manipulation" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  autoFocus={isMobileSearchOpen}
                />
              </div>
              {isMobileSearchOpen && (
                <Button variant="ghost" size="icon" className="md:hidden shrink-0 cursor-pointer" onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(""); }}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </SiteHeader>
      </div>

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
                  className="w-[95%] sm:w-[70%] max-w-[220px] h-11 rounded-full bg-foreground text-background hover:bg-foreground/80 shadow-md font-semibold active:scale-95 touch-manipulation"
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
                    {/* Hidden completely on desktop (md:hidden) */}
                    <TableHead className={`w-[40px] text-center transition-all md:hidden ${selectedProductIds.length > 0 ? "table-cell" : "hidden"}`}>
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
                    <TableHead className="text-right">Price Range</TableHead>
                    <TableHead className="text-right w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const prices = product.variants.map(v => v.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const priceDisplay = minPrice === maxPrice ? `₱${minPrice.toFixed(2)}` : `₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`;

                    return (
                      <TableRow 
                        key={product.id} 
                        className={`group transition-colors cursor-pointer md:cursor-default ${selectedProductIds.includes(product.id) ? "bg-muted/30" : ""}`}
                        
                        onTouchStart={() => {
                          if (selectedProductIds.length === 0) {
                            pressTimer.current = setTimeout(() => {
                              toggleProduct(product.id)
                              if (window.navigator?.vibrate) window.navigator.vibrate(50)
                            }, 450)
                          }
                        }}
                        onTouchEnd={cancelPressTimer}
                        onTouchMove={cancelPressTimer}
                        
                        onClick={() => {
                          if (selectedProductIds.length > 0) toggleProduct(product.id)
                        }}
                      >
                        {/* Hidden completely on desktop (md:hidden) */}
                        <TableCell className={`text-center transition-all md:hidden ${selectedProductIds.length > 0 ? "table-cell" : "hidden"}`}>
                          <input 
                            type="checkbox" 
                            className="accent-primary h-4 w-4 rounded cursor-pointer"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            onClick={(e) => e.stopPropagation()} 
                          />
                        </TableCell>
                        <TableCell>
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted/30 border border-border/50 relative">
                            <img 
                              src={product.image || ""} 
                              alt={product.name} 
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover pointer-events-none" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell><span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">{product.category}</span></TableCell>
                        <TableCell className="text-right font-medium">{priceDisplay}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 cursor-pointer active:scale-95 touch-manipulation" 
                              onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsEditProductOpen(true); }}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 hover:text-destructive hover:bg-destructive/10 cursor-pointer active:scale-95 touch-manipulation" 
                              onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsDeleteProductOpen(true); }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                  className="w-[95%] sm:w-[70%] max-w-[220px] h-11 rounded-full bg-foreground text-background hover:bg-foreground/80 shadow-md font-semibold active:scale-95 touch-manipulation"
                >
                  <Plus className="mr-1 sm:mr-2 h-4 w-4 shrink-0" /> Add Category
                </Button>
              </div>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {/* Hidden completely on desktop (md:hidden) */}
                    <TableHead className={`w-[40px] text-center transition-all md:hidden ${selectedCategoryNames.length > 0 ? "table-cell" : "hidden"}`}>
                      <input 
                        type="checkbox" 
                        className="accent-primary h-4 w-4 rounded cursor-pointer"
                        checked={selectedCategoryNames.length === categories.length && categories.length > 0}
                        onChange={(e) => toggleAllCategories(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Total Items</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const itemCount = inventoryProducts.filter(p => p.category === category).length;
                    return (
                      <TableRow 
                        key={category} 
                        className={`group transition-colors cursor-pointer md:cursor-default ${selectedCategoryNames.includes(category) ? "bg-muted/30" : ""}`}
                        
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
                        
                        onClick={() => {
                          if (selectedCategoryNames.length > 0) toggleCategory(category)
                        }}
                      >
                        {/* Hidden completely on desktop (md:hidden) */}
                        <TableCell className={`text-center transition-all md:hidden ${selectedCategoryNames.length > 0 ? "table-cell" : "hidden"}`}>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-11 w-11 cursor-pointer active:scale-95 touch-manipulation" onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); setNewCategoryName(category); setIsEditCategoryOpen(true); }}><Edit className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="h-11 w-11 hover:text-destructive hover:bg-destructive/10 cursor-pointer active:scale-95 touch-manipulation" onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); setIsDeleteCategoryOpen(true); }}><Trash2 className="h-5 w-5" /></Button>
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
                className="text-xs text-muted-foreground underline text-left cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
            
            <div className="flex gap-2">
              {(activeTab === "products" ? selectedProductIds.length === 1 : selectedCategoryNames.length === 1) && (
                <Button variant="outline" className="cursor-pointer" onClick={handleBulkEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
              <Button variant="destructive" className="cursor-pointer" onClick={handleBulkDelete}>
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
      <AddCategoryModal isOpen={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen} onAddCategory={handleAddCategory} existingProducts={inventoryProducts as any} existingCategories={categories} />

      {/* BULK DELETE CONFIRMATION */}
      <Dialog open={isBulkDeleteConfirmOpen} onOpenChange={setIsBulkDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription className="py-4">
              {activeTab === "products" 
                ? `Are you sure you want to delete ${selectedProductIds.length} selected products? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedCategoryNames.length} selected categories? Products inside will be moved to "Uncategorized".`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkDeleteConfirmOpen(false)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmBulkDelete} className="flex-1 sm:flex-none">Delete All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
