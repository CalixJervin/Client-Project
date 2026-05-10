import { useState } from "react";
import type { Product, Recipe, ProductCategory, ProductAvailability } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ProductsGridProps {
  products: Product[];
  recipes: Recipe[];
  onToggleStock: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Product>) => void;
}

export function ProductsGrid({
  products,
  recipes,
  onToggleStock,
  onDelete,
  onUpdate
}: ProductsGridProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Inventory Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const variant = product.variants[0]; // Simplified as requested: no multiple size variants
              const recipe = recipes.find(r => r.id === variant?.recipeId);
              
              return (
                <TableRow key={product.id} className={!product.inStock ? "bg-muted/20 text-muted-foreground" : ""}>
                  <TableCell>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-10 w-10 rounded-md object-cover border bg-white"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-lg">
                    ₱{variant?.price || 0}
                  </TableCell>
                  <TableCell>
                    {recipe ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {recipe.name}
                      </Badge>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">No recipe linked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {product.availability}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={product.inStock ? "outline" : "destructive"}
                      size="sm"
                      className={`h-8 gap-2 px-3 rounded-full text-[10px] font-bold uppercase transition-all ${
                        product.inStock 
                          ? "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800" 
                          : ""
                      }`}
                      onClick={() => onToggleStock(product.id)}
                    >
                      {product.inStock ? (
                        <>
                          <Eye className="h-3 w-3" />
                          In Stock
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Out of Stock
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <Edit className="h-4 w-4 mr-2" /> Edit (Coming Soon)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No products added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
