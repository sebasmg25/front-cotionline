import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterQuotationRequest } from './register-quotation-request';

describe('RegisterQuotationRequest', () => {
  let component: RegisterQuotationRequest;
  let fixture: ComponentFixture<RegisterQuotationRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterQuotationRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterQuotationRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
