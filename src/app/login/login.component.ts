import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { Router } from '@angular/router';
import { User } from '../model/User';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { HeaderType } from '../enum/header-type.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private notifier: NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  public onLogin(user: User): void {
    console.log(user);
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User> | HttpErrorResponse) => {
          // const token = response.headers.get('Jwt-Token');
          // if(token != null) {
          //   this.authenticationService.saveToken(token);
          // }
          // this.authenticationService.adduserToLocalCache(response.body);
          if (response instanceof HttpResponse) {
            console.log(response);
            const token = response.headers.get(HeaderType.JWT_TOKEN);
            if (token != null) {
              this.authenticationService.saveToken(token);
            }
            if (response.body != null) {
              this.authenticationService.adduserToLocalCache(response.body);
              this.router.navigateByUrl("/user/management");
              this.showLoading = false;
            }
          } else {
            // Handle HttpErrorResponse
            // For example, display an error message
            console.error('Login failed:', response.message);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          // Handle error, if needed
          console.log(errorResponse);
          console.error('An error occurred during login:', errorResponse.error.message);
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  private sendErrorNotification(notificationType: NotificationType, message: string): void {
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
