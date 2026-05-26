export interface Category {
  id: number;
  slug: string;
  name: string;
  parentId: number | null;
  description: string | null;
  productCount?: number;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
