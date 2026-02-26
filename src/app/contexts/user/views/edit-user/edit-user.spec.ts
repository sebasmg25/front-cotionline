import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditUser } from './edit-user';

describe('EditUserComponent', () => {
    let component: EditUser;
    let fixture: ComponentFixture<EditUser>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EditUser]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditUser);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});