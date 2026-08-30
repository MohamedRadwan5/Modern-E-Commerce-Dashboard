import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { CommonModule } from '@angular/common';
import { Product } from '../models/products.model';

@Component({
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  selector: 'app-add-product',
  styleUrl: './add-product.css',
  templateUrl: './add-product.html',
})
export class AddProduct {
  newProduct: Omit<Product, 'id'> = {
    title: '',
    price: 0,
    description: '',
    category: '',
    image: ''
  };

  successMsg = '';
  errorMsg = '';

  constructor(private productService: ProductService) {}

  onSubmit(): void {
    this.productService.addProduct(this.newProduct).subscribe({
      next: (product) => {
        this.successMsg = `Product added: ${product.title}`;
        this.errorMsg = '';
        this.resetForm();
      },
      error: (err) => {
        this.errorMsg = err.message;
        this.successMsg = '';
      }
    });
  }

  resetForm(): void {
    this.newProduct = { title: '', price: 0, description: '', category: '', image: '' };
  }
}