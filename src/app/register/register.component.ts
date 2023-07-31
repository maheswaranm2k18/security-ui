import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { Router } from '@angular/router';
import { User } from '../model/User';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private notifier: NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
  }

  public onRegister(user: User): void {
    console.log(user);
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
          // const token = response.headers.get('Jwt-Token');
          // if(token != null) {
          //   this.authenticationService.saveToken(token);
          // }
          // this.authenticationService.adduserToLocalCache(response.body);
            console.log(response);
            this.showLoading = false;
            this.sendNotification(NotificationType.SUCCESS, 'A new account was created for' + 
            response.firstName + 'Please check your email for password to log in.');
        },
        (errorResponse: HttpErrorResponse) => {
          // Handle error, if needed
          console.log(errorResponse);
          console.error('An error occurred during login:', errorResponse.error.message);
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    // throw new Error('Method not implemented.');
    if (message) {
      this.notifier.notify(notificationType, message);
    } else {
      this.notifier.notify(notificationType, "An error occuerd, please try again");
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
