import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-names',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './product-names.css',
  templateUrl: './product-names.html',
})
export class ProductNames implements OnInit {
  names: string[] = [];
  loading = false;
  errorMsg = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadNames();
  }

  loadNames(): void {
    this.loading = true;
    this.productService.getProductNames().subscribe({
      next: (data) => {
        this.names = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Failed to fetch names';
        this.loading = false;
      }
    });
  }
}