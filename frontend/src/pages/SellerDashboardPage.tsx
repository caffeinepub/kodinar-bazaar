import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useMarkOutOfStock } from '../hooks/useQueries';
import AccessDenied from '../components/AccessDenied';
import ProductForm, { type ProductFormData } from '../components/ProductForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, PackageX, Store, Package, Loader2 } from 'lucide-react';
import { UserRole, type Product } from '../backend';
import { toast } from 'sonner';

export default function SellerDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: myProducts, isLoading: productsLoading } = useGetMyProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const markOutOfStock = useMarkOutOfStock();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Auth checks
  if (!identity) {
    return <AccessDenied message="Please login to access the Seller Dashboard." />;
  }

  if (profileLoading || !isFetched) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </main>
    );
  }

  if (!userProfile || userProfile.role !== UserRole.seller) {
    return (
      <AccessDenied message="Only registered sellers can access this dashboard. Please register as a seller." />
    );
  }

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      await addProduct.mutateAsync(data);
      toast.success('Product added successfully!');
      setShowAddForm(false);
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add product');
      throw err;
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({ productId: editingProduct.id, ...data });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to update product');
      throw err;
    }
  };

  const handleDelete = async (productId: bigint) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success('Product deleted');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to delete product');
    }
  };

  const handleMarkOutOfStock = async (productId: bigint) => {
    try {
      await markOutOfStock.mutateAsync(productId);
      toast.success('Product marked as out of stock');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to update product');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-saffron/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-saffron" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-deep-brown">
                My Shop
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                Welcome back, {userProfile.name}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-saffron hover:bg-saffron-dark text-white font-body font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-saffron/15 p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-body mb-1">Total Products</p>
            <p className="font-display text-2xl font-bold text-deep-brown">
              {myProducts?.length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-saffron/15 p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-body mb-1">In Stock</p>
            <p className="font-display text-2xl font-bold text-green-600">
              {myProducts?.filter((p) => p.stock > BigInt(0)).length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-saffron/15 p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-body mb-1">Out of Stock</p>
            <p className="font-display text-2xl font-bold text-destructive">
              {myProducts?.filter((p) => p.stock === BigInt(0)).length ?? 0}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-saffron/15 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-saffron/10">
            <h2 className="font-display font-semibold text-deep-brown">My Products</h2>
          </div>

          {productsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !myProducts || myProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-saffron/20 mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cream/50">
                    <TableHead className="font-body font-semibold text-deep-brown">Product</TableHead>
                    <TableHead className="font-body font-semibold text-deep-brown">Category</TableHead>
                    <TableHead className="font-body font-semibold text-deep-brown">Price</TableHead>
                    <TableHead className="font-body font-semibold text-deep-brown">Stock</TableHead>
                    <TableHead className="font-body font-semibold text-deep-brown text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myProducts.map((product) => {
                    const imageUrl = product.blob.getDirectURL();
                    const isOutOfStock = product.stock === BigInt(0);

                    return (
                      <TableRow key={product.id.toString()} className="hover:bg-cream/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                              {imageUrl ? (
                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-saffron/20" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-body font-semibold text-deep-brown text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground font-body line-clamp-1 max-w-[200px]">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-terracotta/10 text-terracotta border-terracotta/20 font-body text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-body font-semibold text-saffron">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <span className={`font-body text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-green-600'}`}>
                            {isOutOfStock ? 'Out of Stock' : Number(product.stock)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingProduct(product)}
                              className="h-8 w-8 p-0 hover:bg-saffron/10 hover:text-saffron"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            {!isOutOfStock && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkOutOfStock(product.id)}
                                className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                                title="Mark out of stock"
                              >
                                <PackageX className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">Delete Product?</AlertDialogTitle>
                                  <AlertDialogDescription className="font-body">
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(product.id)}
                                    className="bg-destructive hover:bg-destructive/90 font-body"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-deep-brown">Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleAddProduct}
            submitLabel="Add Product"
            isSubmitting={addProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-deep-brown">Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialValues={{
                name: editingProduct.name,
                description: editingProduct.description,
                price: Number(editingProduct.price).toString(),
                category: editingProduct.category,
                stock: Number(editingProduct.stock).toString(),
              }}
              onSubmit={handleUpdateProduct}
              submitLabel="Update Product"
              isSubmitting={updateProduct.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
