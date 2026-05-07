import { useState } from "react"
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

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct])
    toast.success(`${newProduct.name} added!`)
  }
  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      
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

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        <Tabs defaultValue="products" className="w-full max-w-6xl mx-auto">
          
          <TabsList className="w-full grid grid-cols-2 h-14 bg-muted/80 p-1 rounded-xl mb-2 shadow-inner border border-border/50">
            <TabsTrigger value="products" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">Products</TabsTrigger>
            <TabsTrigger value="categories" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">Categories</TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB CONTENT */}
          <TabsContent value="products" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2">
            
            {/* CHANGED: px-1, w-[95%] on mobile, w-[70%] on sm and up, whitespace-nowrap */}
            <div className="grid grid-cols-2 mb-6">
              <div className="flex justify-center px-1 sm:px-0">
                <Button 
                  onClick={() => setIsAddProductOpen(true)} 
                  className="w-[95%] sm:w-[70%] max-w-[220px] rounded-full bg-foreground text-background hover:bg-foreground/80 shadow-md font-semibold whitespace-nowrap"
                >
                  <Plus className="mr-1 sm:mr-2 h-4 w-4 shrink-0" /> Add Product
                </Button>
              </div>
              <div>{/* Empty Right Side */}</div> 
            </div>

            <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell><span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">{product.category}</span></TableCell>
                      <TableCell className="text-right font-medium">₱{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(product); setIsEditProductOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10" onClick={() => { setSelectedProduct(product); setIsDeleteProductOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
            
            {/* CHANGED: px-1, w-[95%] on mobile, w-[70%] on sm and up, whitespace-nowrap */}
            <div className="grid grid-cols-2 mb-6">
              <div>{/* Empty Left Side */}</div> 
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
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Total Items</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const itemCount = products.filter(p => p.category === category).length;
                    return (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{itemCount} items</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedCategory(category); setNewCategoryName(category); setIsEditCategoryOpen(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10" onClick={() => { setSelectedCategory(category); setIsDeleteCategoryOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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