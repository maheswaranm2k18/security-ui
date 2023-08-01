import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/User';
import { CustomHttpResponse } from '../model/custom-http-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<User[] | HttpErrorResponse> {
    return this.http.get<User[]>(this.host+'/user/list');
  }

  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(this.host+'/user/add', formData);
  }

  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(this.host+'/user/update', formData);
  }

  public resetPassword(email: string): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.get<CustomHttpResponse>(this.host+'/user/resetpassword/'+email);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>| HttpErrorResponse> {
    return this.http.post<User>(this.host+'/user/updateProfileImage', formData,
    {
      reportProgress: true,
      observe: 'events'
    });
  }

  public deleteUser(username: string): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>(this.host+'/user/delete/'+username);
  }

  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    if(localStorage.getItem('users')) {
      return JSON.parse(localStorage.getItem('users') || '');
    }
    return [];
  }

  public createUserFromDate(loggedInUsername: string, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    if(user.active == true) {
      user.notLocked = true;
    } else {
      user.notLocked = false;
    }
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImage);
    return formData;
  }
}