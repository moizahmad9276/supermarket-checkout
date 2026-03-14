import { TestBed } from '@angular/core/testing';
import { BasketService } from './basket.service';
import { Item } from '../models/checkout.models';

const mockApple: Item = {
  id: 1, name: 'Apple', unitPrice: 30,
  specialOffer: { id: 1, quantityRequired: 2, offerPrice: 45, validUntil: '' },
  createdAt: '', updatedAt: '',
};
const mockBanana: Item = {
  id: 2, name: 'Banana', unitPrice: 50,
  specialOffer: { id: 2, quantityRequired: 3, offerPrice: 130, validUntil: '' },
  createdAt: '', updatedAt: '',
};

describe('BasketService', () => {
  let service: BasketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasketService);
  });

  it('should start empty', () => {
    expect(service.isEmpty()).toBeTrue();
    expect(service.totalItems()).toBe(0);
    expect(service.entries().length).toBe(0);
  });

  it('should add a new item', () => {
    service.addItem(mockApple, 1);
    expect(service.entries().length).toBe(1);
    expect(service.totalItems()).toBe(1);
  });

  it('should aggregate quantity when same item added twice', () => {
    service.addItem(mockApple, 1);
    service.addItem(mockApple, 1);
    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].quantity).toBe(2);
    expect(service.totalItems()).toBe(2);
  });

  it('should handle multiple different items', () => {
    service.addItem(mockApple, 2);
    service.addItem(mockBanana, 3);
    expect(service.entries().length).toBe(2);
    expect(service.totalItems()).toBe(5);
  });

  it('should update quantity', () => {
    service.addItem(mockApple, 1);
    service.updateQuantity(mockApple.id, 5);
    expect(service.entries()[0].quantity).toBe(5);
  });

  it('should remove item when quantity set to 0', () => {
    service.addItem(mockApple, 2);
    service.updateQuantity(mockApple.id, 0);
    expect(service.isEmpty()).toBeTrue();
  });

  it('should remove item explicitly', () => {
    service.addItem(mockApple, 1);
    service.addItem(mockBanana, 2);
    service.removeItem(mockApple.id);
    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].item.id).toBe(mockBanana.id);
  });

  it('should clear all items', () => {
    service.addItem(mockApple, 3);
    service.addItem(mockBanana, 2);
    service.clear();
    expect(service.isEmpty()).toBeTrue();
    expect(service.totalItems()).toBe(0);
  });
});
