import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Business } from '../../domain/models/business.model';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-list-business',
    standalone: true,
    imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
    templateUrl: './list-business.html',
    styleUrl: './list-business.css'
})
export class ListBusiness implements OnInit {
    businesses: Business[] = [];
    displayedColumns: string[] = ['name', 'address', 'userId', 'actions'];
    isLoading: boolean = true;

    constructor(
        private router: Router,
        private businessService: BusinessService
    ) { }

    ngOnInit(): void {
        this.loadBusinesses();
    }

    loadBusinesses(): void {
        this.isLoading = true;
        this.businessService.findAll().subscribe({
            next: (data) => {
                this.businesses = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading businesses', error);
                this.isLoading = false;
            }
        });
    }

    deleteBusiness(id: string | undefined): void {
        if (id && confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
            this.businessService.delete(id).subscribe({
                next: () => {
                    this.loadBusinesses(); // Reload the list after deletion
                },
                error: (error) => console.error('Error deleting business', error)
            });
        }
    }

    editBusiness(id: string | undefined): void {
        if (id) {
            this.router.navigate(['/dashboard/business/edit', id]);
        }
    }

    createBusiness(): void {
        this.router.navigate(['/dashboard/business']);
    }
}
