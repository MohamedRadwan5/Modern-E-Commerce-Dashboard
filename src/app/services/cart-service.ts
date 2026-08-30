
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/products.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = new BehaviorSubject<Product[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(product: Product): void {
    const current = this.cartItems.value;
    this.cartItems.next([...current, product]);
  }
}