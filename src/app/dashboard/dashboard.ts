import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../models/products.model';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  loading: boolean = false;

  // Search, Filter & Sort
  searchQuery: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'default';
  viewMode: 'table' | 'grid' = 'table';

  // Stats
  totalProductsCount: number = 0;
  totalCategoriesCount: number = 0;
  avgPrice: number = 0;
  topRatedProduct: Product | null = null;

  // Modals state
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showViewModal: boolean = false;
  showDeleteModal: boolean = false;

  // Selected items for operations
  selectedProduct: Product | null = null;
  productToDelete: Product | null = null;

  // Reactive Forms
  productForm: FormGroup;

  // Notification Toast
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'info' = 'success';
  private toastTimeout: any;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilterAndSort();
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.showToast(err.message || 'Failed to load products', 'error');
        this.loading = false;
      }
    });

    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  calculateStats(): void {
    this.totalProductsCount = this.products.length;
    this.totalCategoriesCount = this.categories.length || new Set(this.products.map(p => p.category)).size;

    if (this.products.length > 0) {
      const sum = this.products.reduce((acc, p) => acc + (p.price || 0), 0);
      this.avgPrice = Number((sum / this.products.length).toFixed(2));

      this.topRatedProduct = this.products.reduce((prev, current) => {
        const prevRate = prev.rating?.rate || 0;
        const currRate = current.rating?.rate || 0;
        return currRate > prevRate ? current : prev;
      }, this.products[0]);
    } else {
      this.avgPrice = 0;
      this.topRatedProduct = null;
    }
  }

  applyFilterAndSort(): void {
    let result = [...this.products];

    // Search filter
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    // Sort
    if (this.sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (this.sortBy === 'rating') {
      result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    this.filteredProducts = result;
  }

  onSearchChange(): void {
    this.applyFilterAndSort();
  }

  onCategoryChange(): void {
    this.applyFilterAndSort();
  }

  onSortChange(): void {
    this.applyFilterAndSort();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.sortBy = 'default';
    this.applyFilterAndSort();
  }

  // --- CRUD: CREATE ---
  openAddModal(): void {
    this.productForm.reset({
      title: '',
      price: 0,
      category: this.categories[0] || 'electronics',
      description: '',
      image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg'
    });
    this.showAddModal = true;
  }

  submitAdd(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const newProductData = this.productForm.value;
    this.loading = true;
    this.productService.addProduct(newProductData).subscribe({
      next: (res) => {
        // FakeStore API returns ID (e.g. 21)
        const createdProduct: Product = {
          ...newProductData,
          id: res.id || Math.floor(Math.random() * 1000) + 100,
          rating: { rate: 4.5, count: 1 }
        };
        this.products = [createdProduct, ...this.products];
        this.applyFilterAndSort();
        this.calculateStats();
        this.showAddModal = false;
        this.loading = false;
        this.showToast(`Product "${createdProduct.title}" created successfully!`, 'success');
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.message || 'Error creating product', 'error');
      }
    });
  }

  // --- CRUD: READ DETAILS ---
  openViewModal(product: Product): void {
    this.selectedProduct = product;
    this.showViewModal = true;
  }

  // --- CRUD: UPDATE ---
  openEditModal(product: Product): void {
    this.selectedProduct = product;
    this.productForm.patchValue({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image
    });
    this.showEditModal = true;
  }

  submitEdit(): void {
    if (!this.selectedProduct || this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const updatedData = this.productForm.value;
    const targetId = this.selectedProduct.id;

    this.loading = true;
    this.productService.updateProduct(targetId, updatedData).subscribe({
      next: (res) => {
        this.products = this.products.map(p => {
          if (p.id === targetId) {
            return {
              ...p,
              ...updatedData
            };
          }
          return p;
        });
        this.applyFilterAndSort();
        this.calculateStats();
        this.showEditModal = false;
        this.selectedProduct = null;
        this.loading = false;
        this.showToast(`Product #${targetId} updated successfully!`, 'success');
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.message || 'Error updating product', 'error');
      }
    });
  }

  // --- CRUD: DELETE ---
  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    const targetId = this.productToDelete.id;
    const title = this.productToDelete.title;

    this.loading = true;
    this.productService.deleteProduct(targetId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== targetId);
        this.applyFilterAndSort();
        this.calculateStats();
        this.showDeleteModal = false;
        this.productToDelete = null;
        this.loading = false;
        this.showToast(`Product "${title}" deleted successfully!`, 'success');
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.message || 'Error deleting product', 'error');
      }
    });
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.showDeleteModal = false;
    this.selectedProduct = null;
    this.productToDelete = null;
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }
}
