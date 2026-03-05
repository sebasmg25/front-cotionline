import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Branch } from '../../domain/models/branch.model';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-list-branches',
    standalone: true,
    imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
    templateUrl: './list-branches.html',
    styleUrl: './list-branches.css'
})
export class ListBranches implements OnInit {
    branches: Branch[] = [];
    displayedColumns: string[] = ['name', 'address', 'businessId', 'actions'];
    isLoading: boolean = true;

    constructor(
        private router: Router,
        private branchService: BranchService
    ) { }

    ngOnInit(): void {
        this.loadBranches();
    }

    loadBranches(): void {
        this.isLoading = true;
        this.branchService.findAll().subscribe({
            next: (data) => {
                this.branches = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading branches', error);
                this.isLoading = false;
            }
        });
    }

    deleteBranch(id: string | undefined): void {
        if (id && confirm('¿Estás seguro de que deseas eliminar esta sede?')) {
            this.branchService.delete(id).subscribe({
                next: () => {
                    this.loadBranches(); // Reload the list after deletion
                },
                error: (error) => console.error('Error deleting branch', error)
            });
        }
    }

    editBranch(id: string | undefined): void {
        if (id) {
            this.router.navigate(['/dashboard/branch/edit', id]);
        }
    }

    createBranch(): void {
        this.router.navigate(['/dashboard/branch']);
    }
}
