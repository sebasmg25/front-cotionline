import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../domain/models/user.model';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-list-users',
    standalone: true,
    imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
    templateUrl: './list-users.html',
    styleUrl: './list-users.css'
})
export class ListUsers implements OnInit {
    users: User[] = [];
    displayedColumns: string[] = ['name', 'email', 'city', 'actions'];
    isLoading: boolean = true;

    constructor(
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.userService.findAll().subscribe({
            next: (data) => {
                this.users = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading users', error);
                this.isLoading = false;
            }
        });
    }

    deleteUser(id: string | undefined): void {
        if (id && confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            this.userService.delete(id).subscribe({
                next: () => {
                    this.loadUsers(); // Reload the list after deletion
                },
                error: (error) => console.error('Error deleting user', error)
            });
        }
    }

    editUser(id: string | undefined): void {
        if (id) {
            this.router.navigate(['/dashboard/users/edit', id]);
        }
    }

    createUser(): void {
        this.router.navigate(['/dashboard/user']);
    }
}
