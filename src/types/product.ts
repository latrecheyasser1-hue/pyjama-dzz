export type WarehouseType = 'delivery' | 'store' | 'wholesale';

export interface WarehouseColorConfig {
  color_name: string;
  color_hex: string;
  image_url?: string;
  is_available: boolean;
}

export interface WarehouseInventoryContext {
  warehouse_type: WarehouseType;
  price: number | null;
  compare_at_price?: number | null;
  wholesale_price?: number | null;
  super_gros_price?: number | null;
  min_wholesale_series?: number | null;
  super_gros_threshold?: number | null;
  smallest_size?: string | null;
  largest_size?: string | null;
  active_sizes: string[];
  pieces_per_size_map: Record<string, number>;
  colors: WarehouseColorConfig[];
}

export interface GlobalProductIdentity {
  id: string;
  title: string;
  sku: string;
  category: string;
  // STRICT RULE: ONLY Global Identity Fields Shared
}

export interface IsolatedProductState {
  identity: GlobalProductIdentity;
  warehouses: Record<WarehouseType, WarehouseInventoryContext>;
}
