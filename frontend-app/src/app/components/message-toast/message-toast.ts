import { Component, inject, signal } from '@angular/core';
import { MessageService } from '../../services/message.service';  

@Component({
  selector: 'app-message-toast',
  standalone: true,
  imports: [],
  templateUrl: './message-toast.html',
  styleUrl: './message-toast.css'
})
export class MessageToastComponent {

  private readonly _messageService = inject(MessageService);
  toastVisible = this._messageService.toastVisible;
  toastMessage = this._messageService.toastMessage;
}