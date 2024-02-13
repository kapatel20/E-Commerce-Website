import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSpecificComponent } from './product-specific.component';

describe('ProductSpecificComponent', () => {
  let component: ProductSpecificComponent;
  let fixture: ComponentFixture<ProductSpecificComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductSpecificComponent]
    });
    fixture = TestBed.createComponent(ProductSpecificComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
