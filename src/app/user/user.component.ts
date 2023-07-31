import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/User';
import { UserService } from '../service/user.service';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-response';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';
import { Role } from '../enum/role.enum';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users!: User[];
  public refreshing: boolean | undefined;
  private subscriptions: Subscription[] = [];
  public selectedUser!: User;
  public fileName!: string;
  public profileImage!: any;
  public editUser = new User();
  public currentusername!: string;
  public user!: User | null;
  public fileStatus = new FileUploadStatus();

  constructor(private userService: UserService, private notificationService: NotificationService,
    private renderer: Renderer2, public dialog: MatDialog, private modalService: NgbModal,
    private authenticationService: AuthenticationService, private router: Router) { }

  // @ViewChild('openUserInfoButton') openUserInfoButtonRef!: ElementRef;

  // Call this function to open the user info modal programmatically
  // openUserInfoModal() {
  //   const openUserInfoButton = this.openUserInfoButtonRef.nativeElement;
  //   this.renderer.setAttribute(openUserInfoButton, 'data-toggle', 'modal');
  //   this.renderer.setAttribute(openUserInfoButton, 'data-target', '#viewUserModel');
  //   openUserInfoButton.click();
  // }

  // @ViewChild('openUserInfoButton') openUserInfoButton!: ModalDirective;

  closeResult: string = '';

  
  
  ngOnInit(): void {
    if(this.authenticationService.getUserFromLocalCache() != undefined) {
      this.user = this.authenticationService.getUserFromLocalCache();
    } else {
      this.user = null;
    }
    
    this.getUsers(true);
  }

  showUserTable = true;
  showChangePassword = false;
  selectedIndex = 0;

  toggleContent(index: number) {
    // if (content === 'users') {
    //   this.showUserTable = true;
    //   this.showChangePassword = false;
    // } else if (content === 'reset-password') {
    //   this.showUserTable = false;
    //   this.showChangePassword = true;
    // }
    this.selectedIndex = index;
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[] | HttpErrorResponse) => {
          if(!(response instanceof HttpErrorResponse)) {
            this.userService.addUsersToLocalCache(response);
            this.users = response;
            this.refreshing = false;
            if(showNotification) {
              this.sendNotification(NotificationType.SUCCESS, response.length + 'user(s) loaded successfully...');
            }
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    document.getElementById('openUserInfo')?.click();
    // document.getElementById('mymodal')?.click();
    // this.open(selectedUser);
  }

  // onSelectUser(user: any) {
    // this.selectedUser = user;
    // this.openUserInfoDialog(user);
  // }

  // openUserInfoDialog(user: any) {
  //   this.dialog.open(UserInfoDialogComponent, {
  //     data: user,
  //     disableClose: true,
  //   });
  // }

  /**
   * Write code on Method
   *
   * @return response()
   */
  open(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  } 
    
  /**
   * Write code on Method
   *
   * @return response()
   */
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  public onProfileImageChange1(event: any): void {
    console.log(event.target.files[0].name, event.target.files[0]);
    this.fileName = event.target.files[0].name;
    this.profileImage = event.target.files[0];
  }

  public onProfileImageChange(filename: any, file: File): void {
    this.fileName = filename;
    this.profileImage = file;
  }

  public saveNewUser(): void {
    document.getElementById('new-user-save')?.click();
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFromDate('', userForm.value, this.profileImage);
    this.subscriptions.push(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          document.getElementById('new-user-close')?.click();
          this.getUsers(false);
          this.fileName = '';
          delete this.profileImage;
          userForm.reset();
          this.sendNotification(NotificationType.SUCCESS, response.firstName + response.lastName + 'saved successfully!...');
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          delete this.profileImage;
        }
      )
      );
  }

  public onUpdateUser(): void {
    const formData = this.userService.createUserFromDate(this.currentusername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          document.getElementById('closeEditUserModalButton')?.click();
          this.getUsers(false);
          this.fileName = '';
          delete this.profileImage;
          this.sendNotification(NotificationType.SUCCESS, response.firstName + response.lastName + 'updated successfully!...');
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          delete this.profileImage;
        }
      )
    );
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    const userDetails = this.authenticationService.getUserFromLocalCache();
this.currentusername = userDetails ? userDetails.username : '';
if(userDetails !== null) {
  this.editUser = user;
  // this.profileImage = userDetails.profileImageUrl;
}


    const formData = this.userService.createUserFromDate(this.currentusername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.adduserToLocalCache(response);
          this.getUsers(false);
          this.fileName = '';
          delete this.profileImage;
          this.sendNotification(NotificationType.SUCCESS, response.firstName + response.lastName + 'updated successfully!...');
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          delete this.profileImage;
        }
      )
    );
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    const name = 
    formData.append('username', this.user?.username ? this.user?.username :'');
    formData.append('profileImage', this.profileImage);
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpErrorResponse | HttpEvent<any>) => {
          console.log(event);
          if(!(event instanceof HttpErrorResponse))
          this.reportUploadProgress(event);
          // this.sendNotification(NotificationType.SUCCESS, 'Profile image updated successfully!...');
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  private reportUploadProgress(event: HttpEvent<any>): void {
    // throw new Error("Method not implemented...");
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total !== undefined) {
          this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
          this.fileStatus.status = 'progress';
        } else {
          // Handle the case when event.total is undefined (optional)
          this.fileStatus.percentage = 0; // or set some default value
        }
        break;

      case HttpEventType.Response:
        if (event.status === 200) {
          if(this.user !== null)
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          let message = event.body.firstName + '\s profile image updated successfully';
          this.sendNotification(NotificationType.SUCCESS, message);
          this.fileStatus.status = 'done';
          break;
        } else {
          this.sendNotification(NotificationType.SUCCESS, 'unable to upload image. please try again');
          break;
        }
      default:
        'Finished all processes';
    }
  }

  public updateProfileImage(): void {
    document.getElementById('profile-image-input')?.click();
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, 'You have been successfully logged out');
  }

  // public onDeleteUser(userId: number): void {
  //   this.subscriptions.push(
  //     this.userService.deleteUser(userId).subscribe(
  //       (response: CustomHttpResponse | HttpErrorResponse) => {
  //         if(!(response instanceof HttpErrorResponse)) {
  //           this.sendNotification(NotificationType.SUCCESS, response.message);
  //           this.getUsers(false);
  //         }
  //       },
  //       (errorResponse: HttpErrorResponse) => {
  //         this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
  //         delete this.profileImage;
  //       }
  //     )
  //   )
  // }

  public onDeleteUser(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpResponse | HttpErrorResponse) => {
          if(!(response instanceof HttpErrorResponse)) {
            this.sendNotification(NotificationType.SUCCESS, response.message);
            this.getUsers(false);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          delete this.profileImage;
        }
      )
    )
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const email = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(email).subscribe(
        (response: CustomHttpResponse | HttpErrorResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    );
  }

  // public onProfileImageChange(fileName: string, file: File): void {
  //   console.log(fileName, file);
  // }

  public searchUsers(searchTerm: string): void {
    console.log(searchTerm);
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 || 
          user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 || 
          user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
            results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentusername = editUser.username;
    document.getElementById('openUserEdit')?.click();
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    // throw new Error('Method not implemented.');
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, "An error occuerd, please try again");
    }
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }

  private getUserRole(): string {
    const userRole =  this.authenticationService.getUserFromLocalCache()?.role;
    if (userRole !== undefined) {
      return userRole;
    } else {
      // Handle the case when userRole is undefined, e.g., return a default role
      return 'defaultRole'; // Use 'defaultRole' or any other suitable default value
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
