'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Product, StockType, Category } from '@/types/admin';
import AddProductModal from '@/components/admin/products/AddProductModal';
import InventoryGrid from '@/components/admin/inventory/InventoryGrid';

interface InventoryManagerProps {
  products: Product[];
  categories?: Category[];
  activeStockTab?: StockType;
  onUpdateStock: (variantId: string, stockType: StockType, newQuantity: number) => void;
  onAddProduct?: (newProduct: Product) => void;
  onDeleteProduct?: (productId: string, stockType?: StockType) => void;
  onUpdateProduct?: (updatedProduct: Product) => void;
  reFetchProducts?: () => Promise<void>;
}

export default function InventoryManager({
  products = [],
  categories = [],
  activeStockTab = 'DELIVERY',
  onUpdateStock,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  reFetchProducts,
}: InventoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) =>
    p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDynamicTitle = (type: StockType) => {
    switch (type) {
      case 'DELIVERY':
        return 'المخزون والمستودعات • مخزون التوصيل (Delivery Warehouse)';
      case 'STORE':
        return 'المخزون والمستودعات • مخزون المحل (POS Store Warehouse)';
      case 'WHOLESALE':
        return 'المخزون والمستودعات • مخزون الجملة (Wholesale Warehouse)';
      default:
        return 'المخزون والمستودعات';
    }
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsAddModalOpen(true);
  };

  const handleProductCreated = (newProd: Product) => {
    if (onAddProduct) {
      onAddProduct(newProd);
    }
  };

  const handleProductUpdated = (updatedProd: Product) => {
    if (onUpdateProduct) {
      onUpdateProduct(updatedProd);
    } else if (onAddProduct) {
      onAddProduct(updatedProd);
    }
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Single Unified Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-bold text-pyjama-charcoal">
            {getDynamicTitle(activeStockTab)}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            متابعة وإدارة التغييرات المعزولة بالسياق للمستودع النشط حالياً
          </p>
        </div>

        {/* Embedded Action Controls (Search Bar + Primary Burgundy Button) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو رمز SKU..."
              className="w-full pr-10 pl-4 py-2.5 bg-pyjama-cream/50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] transition-all font-sans"
            />
          </div>

          {/* Primary Burgundy Add Product Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              إضافة منتج في هذا المستودع ({activeStockTab === 'DELIVERY' ? 'التوصيل' : activeStockTab === 'STORE' ? 'المحل' : 'الجملة'})
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Two-Level Card-based Inventory UI */}
      <InventoryGrid
        products={filteredProducts}
        categories={categories}
        activeStockTab={activeStockTab}
        onUpdateStock={onUpdateStock}
        onDeleteProduct={onDeleteProduct}
        onEditProduct={handleEditProduct}
      />

      {/* Add / Edit Product Modal with Strict Warehouse Context Isolation */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeWarehouse={activeStockTab}
        onProductAdded={handleProductCreated}
        onProductUpdated={handleProductUpdated}
        reFetchProducts={reFetchProducts}
        productToEdit={productToEdit}
      />
    </div>
  );
}
