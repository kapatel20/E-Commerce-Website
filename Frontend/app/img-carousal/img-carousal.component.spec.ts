import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgCarousalComponent } from './img-carousal.component';

describe('ImgCarousalComponent', () => {
  let component: ImgCarousalComponent;
  let fixture: ComponentFixture<ImgCarousalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImgCarousalComponent]
    });
    fixture = TestBed.createComponent(ImgCarousalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
