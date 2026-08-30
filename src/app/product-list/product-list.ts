import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/products.model';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  products: Product[] = [];
  loading = false;
  errorMsg = '';
  showExpensiveOnly = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.message;
        this.loading = false;
      }
    });
  }

  loadExpensiveProducts(): void {
    this.loading = true;
    this.productService.getExpensiveProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.message;
        this.loading = false;
      }
    });
  }

  toggleFilter(): void {
    this.showExpensiveOnly = !this.showExpensiveOnly;
    this.showExpensiveOnly ? this.loadExpensiveProducts() : this.loadProducts();
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
      },
      error: (err) => {
        this.errorMsg = err.message;
      }
    });
  }
}