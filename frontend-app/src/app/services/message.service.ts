import { Injectable, signal} from '@angular/core';


@Injectable({ providedIn: 'root' })
export class MessageService {
  
  toastVisible = signal(false);
  toastMessage = signal('');

  showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);

    console.log(this.toastMessage());
    console.log(this.toastVisible());

    window.setTimeout(() => {
      this.toastVisible.set(false);
      this.toastMessage.set('');
    }, 2500);
  }

}
