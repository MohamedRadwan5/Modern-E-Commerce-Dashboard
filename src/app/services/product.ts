import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { Product } from '../models/products.model';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://fakestoreapi.com/products';
  private isBrowser: boolean;

  // In-Memory Cache for Instant 0ms Load
  private cachedProducts: Product[] | null = null;
  private cachedCategories: string[] | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // READ: Get all products (with Instant Cache)
  getAllProducts(forceRefresh: boolean = false): Observable<Product[]> {
    if (!forceRefresh && this.cachedProducts && this.cachedProducts.length > 0) {
      return of(this.cachedProducts); // Instant 0ms response
    }

    return this.http.get<Product[]>(this.baseUrl).pipe(
      tap(products => {
        this.cachedProducts = products;
      }),
      catchError(err => {
        console.error('API Error in getAllProducts:', err);
        return of(this.cachedProducts || []);
      })
    );
  }

  // READ: Get product by ID
  getProductById(id: number): Observable<Product | null> {
    if (this.cachedProducts) {
      const found = this.cachedProducts.find(p => p.id === id);
      if (found) {
        return of(found);
      }
    }

    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error('API Error in getProductById:', err);
        return of(null);
      })
    );
  }

  // READ: Get product names (Instant from Cache)
  getProductNames(): Observable<string[]> {
    if (this.cachedProducts && this.cachedProducts.length > 0) {
      return of(this.cachedProducts.map(p => p.title));
    }

    return this.getAllProducts().pipe(
      map(products => products.map(p => p.title))
    );
  }

  // READ: Filter expensive products (> 500)
  getExpensiveProducts(): Observable<Product[]> {
    if (this.cachedProducts && this.cachedProducts.length > 0) {
      return of(this.cachedProducts.filter(p => p.price > 500));
    }

    return this.getAllProducts().pipe(
      map(products => products.filter(p => p.price > 500))
    );
  }

  // READ: Get product categories
  getCategories(): Observable<string[]> {
    if (this.cachedCategories && this.cachedCategories.length > 0) {
      return of(this.cachedCategories);
    }

    return this.http.get<string[]>(`${this.baseUrl}/categories`).pipe(
      tap(cats => {
        this.cachedCategories = cats;
      }),
      catchError(err => {
        console.error('API Error in getCategories:', err);
        const fallback = ['electronics', 'jewelery', "men's clothing", "women's clothing"];
        this.cachedCategories = fallback;
        return of(fallback);
      })
    );
  }

  // READ: Get products by category
  getProductsByCategory(category: string): Observable<Product[]> {
    if (this.cachedProducts && this.cachedProducts.length > 0) {
      if (category === 'all') return of(this.cachedProducts);
      return of(this.cachedProducts.filter(p => p.category === category));
    }

    return this.http.get<Product[]>(`${this.baseUrl}/category/${category}`).pipe(
      catchError(err => {
        console.error('API Error in getProductsByCategory:', err);
        return of([]);
      })
    );
  }

  // CREATE: Add new product (Updates Cache Instantly)
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product).pipe(
      map(res => {
        const newProduct: Product = {
          ...product,
          id: res.id || Math.floor(Math.random() * 1000) + 100,
          rating: { rate: 4.5, count: 1 }
        };
        if (this.cachedProducts) {
          this.cachedProducts = [newProduct, ...this.cachedProducts];
        }
        return newProduct;
      }),
      catchError(err => {
        console.error('API Error in addProduct:', err);
        const mockCreated: Product = {
          ...product,
          id: Math.floor(Math.random() * 1000) + 100,
          rating: { rate: 4.5, count: 1 }
        };
        if (this.cachedProducts) {
          this.cachedProducts = [mockCreated, ...this.cachedProducts];
        }
        return of(mockCreated);
      })
    );
  }

  // UPDATE: Update existing product (Updates Cache Instantly)
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product).pipe(
      map(() => {
        const updated: Product = {
          id,
          title: product.title || '',
          price: product.price || 0,
          description: product.description || '',
          category: product.category || '',
          image: product.image || ''
        };
        if (this.cachedProducts) {
          this.cachedProducts = this.cachedProducts.map(p => p.id === id ? { ...p, ...updated } : p);
        }
        return updated;
      }),
      catchError(err => {
        console.error('API Error in updateProduct:', err);
        const mockUpdated: Product = {
          id,
          title: product.title || '',
          price: product.price || 0,
          description: product.description || '',
          category: product.category || '',
          image: product.image || ''
        };
        if (this.cachedProducts) {
          this.cachedProducts = this.cachedProducts.map(p => p.id === id ? { ...p, ...mockUpdated } : p);
        }
        return of(mockUpdated);
      })
    );
  }

  // DELETE: Delete product (Removes from Cache Instantly)
  deleteProduct(id: number): Observable<boolean> {
    if (this.cachedProducts) {
      this.cachedProducts = this.cachedProducts.filter(p => p.id !== id);
    }
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }
}