import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MessageToastComponent} from './components/message-toast/message-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

