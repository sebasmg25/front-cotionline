import { Component } from '@angular/core';
import { UserRepository } from '../../domain/user.repository';
import { UserService } from '../../../../infraestructure/services/user/user.service';

@Component({
  selector: 'app-register-user',
  imports: [],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {
  //instanciado desde constructor
  // public userRepository: UserRepository = new UserService();
  constructor() {
    // this.userRepository.findById('ff');
  }
}
