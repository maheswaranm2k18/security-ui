import { Injectable } from '@angular/core';
import { NotificationType } from '../enum/notification-type.enum';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private notifier: NotifierService) { }

  public notify(type: NotificationType, message: string) {
    this.notifier.notify(type, message);
  }
}
