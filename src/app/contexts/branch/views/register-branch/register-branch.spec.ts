import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterBranch } from './register-branch';

describe('RegisterBranch', () => {
  let component: RegisterBranch;
  let fixture: ComponentFixture<RegisterBranch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterBranch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterBranch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
