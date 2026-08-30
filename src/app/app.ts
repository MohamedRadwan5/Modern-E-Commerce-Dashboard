import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from './dashboard/dashboard';
import { ProductList } from './product-list/product-list';
import { AddProduct } from './add-product/add-product';
import { UpdateProduct } from './update-product/update-product';
import { ProductNames } from './product-names/product-names';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Dashboard,
    ProductList,
    AddProduct,
    UpdateProduct,
    ProductNames
  ],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  activeTab: 'dashboard' | 'list' | 'add' | 'update' | 'names' = 'dashboard';

  setActiveTab(tab: 'dashboard' | 'list' | 'add' | 'update' | 'names'): void {
    this.activeTab = tab;
  }
}
