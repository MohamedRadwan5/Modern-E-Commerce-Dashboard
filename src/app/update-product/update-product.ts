import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Product } from '../models/products.model';
import { ProductService } from '../services/product';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update-product.html',
  styleUrl: './update-product.css',
})
export class UpdateProduct implements OnInit, OnChanges {
  @Input() productId?: number;

  productList: Product[] = [];
  selectedId: number | null = null;
  product: Product | null = null;
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProductList();
  }

  ngOnChanges(): void {
    if (this.productId) {
      this.selectedId = this.productId;
      this.onSelectProduct();
    }
  }

  loadProductList(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.productList = products;
        if (this.productId) {
          this.selectedId = this.productId;
          this.onSelectProduct();
        } else if (products.length > 0 && !this.selectedId) {
          this.selectedId = products[0].id;
          this.onSelectProduct();
        }
      },
      error: (err) => {
        this.errorMsg = err.message || 'Failed to load products list.';
      }
    });
  }

  onSelectProduct(): void {
    if (!this.selectedId) return;
    const found = this.productList.find(p => p.id == this.selectedId);
    if (found) {
      this.product = { ...found };
    } else {
      this.loading = true;
      this.productService.getProductById(this.selectedId).subscribe({
        next: (p) => {
          if (p) {
            this.product = { ...p };
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = err.message;
          this.loading = false;
        }
      });
    }
  }

  onUpdate(): void {
    if (!this.product) return;

    this.loading = true;
    this.productService.updateProduct(this.product.id, this.product).subscribe({
      next: (updated) => {
        this.successMsg = `Product #${updated?.id || this.product?.id} updated successfully!`;
        this.errorMsg = '';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.message;
        this.successMsg = '';
        this.loading = false;
      }
    });
  }
}
