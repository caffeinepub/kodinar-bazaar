import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Category, ExternalBlob } from '../backend';
import { Upload, Loader2, ImageIcon } from 'lucide-react';

// Map Category enum values to display labels
export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: Category.fruits, label: 'Fruits' },
  { value: Category.vegetables, label: 'Vegetables' },
  { value: Category.bakedGoods, label: 'Baked Goods' },
  { value: Category.dairy, label: 'Dairy' },
  { value: Category.nuts, label: 'Nuts' },
  { value: Category.beverages, label: 'Beverages' },
  { value: Category.seafood, label: 'Sea Foods' },
];

export interface ProductFormData {
  name: string;
  description: string;
  price: bigint;
  category: Category;
  blob: ExternalBlob;
  stock: bigint;
}

interface ProductFormProps {
  initialValues?: {
    name: string;
    description: string;
    price: string;
    category: string;
    stock: string;
  };
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = 'Add Product',
  isSubmitting = false,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [price, setPrice] = useState(initialValues?.price || '');
  const [category, setCategory] = useState<Category | ''>(
    (initialValues?.category as Category) || ''
  );
  const [stock, setStock] = useState(initialValues?.stock || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!imageFile && !initialValues) {
      setError('Please select a product image');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    try {
      let blob: ExternalBlob;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setUploadProgress(pct));
      } else {
        // For updates without new image, use a placeholder URL blob
        blob = ExternalBlob.fromURL('');
      }

      await onSubmit({
        name,
        description,
        price: BigInt(Math.round(parseFloat(price))),
        category: category as Category,
        blob,
        stock: BigInt(parseInt(stock)),
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setStock('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="font-body font-medium">Product Image</Label>
        <div
          className="border-2 border-dashed border-saffron/30 rounded-lg p-4 text-center cursor-pointer hover:border-saffron/60 transition-colors bg-cream/50"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <ImageIcon className="w-8 h-8 text-saffron/40" />
              <p className="text-sm text-muted-foreground font-body">Click to upload image</p>
              <p className="text-xs text-muted-foreground font-body">JPG, PNG, WebP up to 10MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-body">Uploading: {uploadProgress}%</p>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="prod-name" className="font-body font-medium">Product Name</Label>
          <Input
            id="prod-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fresh Tomatoes"
            required
            className="font-body"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prod-category" className="font-body font-medium">Category</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as Category)} required>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="font-body">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prod-desc" className="font-body font-medium">Description</Label>
        <Textarea
          id="prod-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product..."
          rows={3}
          required
          className="font-body resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="prod-price" className="font-body font-medium">Price (₹)</Label>
          <Input
            id="prod-price"
            type="number"
            min="1"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 50"
            required
            className="font-body"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prod-stock" className="font-body font-medium">Stock Quantity</Label>
          <Input
            id="prod-stock"
            type="number"
            min="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="e.g. 100"
            required
            className="font-body"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive font-body">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !name || !description || !price || !category || !stock}
        className="w-full bg-saffron hover:bg-saffron-dark text-white font-body font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {submitLabel}
          </>
        )}
      </Button>
    </form>
  );
}
