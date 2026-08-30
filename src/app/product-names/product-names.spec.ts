import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductNames } from './product-names';

describe('ProductNames', () => {
  let component: ProductNames;
  let fixture: ComponentFixture<ProductNames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductNames],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductNames);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
