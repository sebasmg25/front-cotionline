import { Component } from '@angular/core';
import { UserRepository } from '../../domain/user.repository';
import { UserService } from '../../../../infraestructure/services/user/user.service';

@Component({
    selector: 'app-edit-user',
    imports: [],
    templateUrl: './edit-user.html',
    styleUrl: './edit-user.css',
})
export class EditUser {
    //instanciado desde constructor
    // public userRepository: UserRepository = new UserService();
    constructor() {
        // this.userRepository.findById('ff');
    }
}