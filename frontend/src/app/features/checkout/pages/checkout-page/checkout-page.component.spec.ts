import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CheckoutPageComponent } from './checkout-page.component';
import { BasketService } from '../../../../core/services/basket.service';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { of, throwError } from 'rxjs';
import { Item, CheckoutResponse } from '../../../../core/models/checkout.models';
import { provideAnimations } from '@angular/platform-browser/animations';

const mockApple: Item = {
  id: 1, name: 'Apple', unitPrice: 30,
  specialOffer: { id: 1, quantityRequired: 2, offerPrice: 45 },
  createdAt: '', updatedAt: '',
};

const mockReceipt: CheckoutResponse = {
  lineItems: [{ name: 'Apple', quantity: 2, unitPrice: 30, offerGroupsApplied: 1, savings: 15, subtotal: 45 }],
  totalWithoutOffers: 60,
  totalSavings: 15,
  totalPrice: 45,
};

describe('CheckoutPageComponent', () => {
  let fixture: ComponentFixture<CheckoutPageComponent>;
  let component: CheckoutPageComponent;
  let basketService: BasketService;
  let checkoutService: jasmine.SpyObj<CheckoutService>;

  beforeEach(async () => {
    const checkoutSpy = jasmine.createSpyObj('CheckoutService', ['calculate']);

    await TestBed.configureTestingModule({
      imports: [CheckoutPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
        { provide: CheckoutService, useValue: checkoutSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutPageComponent);
    component = fixture.componentInstance;
    basketService = TestBed.inject(BasketService);
    checkoutService = TestBed.inject(CheckoutService) as jasmine.SpyObj<CheckoutService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add item to basket', () => {
    (component as any).onItemAdded({ item: mockApple, quantity: 2 });
    expect(basketService.totalItems()).toBe(2);
  });

  it('should clear receipt when item added after checkout', () => {
    checkoutService.calculate.and.returnValue(of(mockReceipt));
    basketService.addItem(mockApple, 2);
    (component as any).onCheckout();
    fixture.detectChanges();

    // adding another item resets the receipt
    (component as any).onItemAdded({ item: mockApple, quantity: 1 });
    expect((component as any).receipt()).toBeNull();
  });

  it('should call checkoutService with correct basket', () => {
    checkoutService.calculate.and.returnValue(of(mockReceipt));
    basketService.addItem(mockApple, 2);

    (component as any).onCheckout();

    expect(checkoutService.calculate).toHaveBeenCalledWith({
      items: [{ name: 'Apple', quantity: 2 }],
    });
  });

  it('should set receipt on successful checkout', () => {
    checkoutService.calculate.and.returnValue(of(mockReceipt));
    basketService.addItem(mockApple, 2);

    (component as any).onCheckout();

    expect((component as any).receipt()).toEqual(mockReceipt);
  });

  it('should clear basket and receipt on new order', () => {
    checkoutService.calculate.and.returnValue(of(mockReceipt));
    basketService.addItem(mockApple, 2);
    (component as any).onCheckout();

    (component as any).onNewOrder();

    expect(basketService.isEmpty()).toBeTrue();
    expect((component as any).receipt()).toBeNull();
  });
});
