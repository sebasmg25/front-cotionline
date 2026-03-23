import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor() { }

    private showAlert(title: string, message: string, icon: SweetAlertIcon) {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonColor: '#3f51b5',
            confirmButtonText: 'Entendido',
            timer: 4000,
            timerProgressBar: true,
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    }

    showSuccess(title: string, message: string) {
        this.showAlert(title, message, 'success');
    }

    showError(title: string, message: string) {
        this.showAlert(title, message, 'error');
    }

    showWarning(title: string, message: string) {
        this.showAlert(title, message, 'warning');
    }

    showInfo(title: string, message: string) {
        this.showAlert(title, message, 'info');
    }

    confirmAction(
        title: string,
        text: string,
        confirmText: string = 'Sí, continuar',
        cancelText: string = 'No, cancelar'
    ): Promise<boolean> {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#9e9e9e',
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true
        }).then((result) => {
            return result.isConfirmed;
        });
    }
}
