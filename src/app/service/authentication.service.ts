import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/User';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public host: string = 'http://localhost:8080';
  private token!: string;
  public loggedInUsername!: string;
  private jwtHelper = new JwtHelperService;

  constructor(private http: HttpClient) { }

  public login(user: User): Observable<HttpResponse<any> | HttpErrorResponse> {
    //here we need entire response so we use "OBSERVE"
    return this.http.post<HttpResponse<any>>
    (this.host+'/user/login', user, {observe: 'response'});
  }

  public register(user: User): Observable<User> {
    return this.http.post<User>
    (this.host+'/user/register', user);
  }

  public logOut(): void {
    this.token = '';
    this.loggedInUsername = '';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public adduserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User | null{
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }

  public loadToken(): void {
    this.token = localStorage.getItem('token') || '';
  }

  public getToken(): string {
    return this.token;
  }

  public isUserLoggedIn(): boolean {
    this.loadToken();
    if(this.token !== null && this.token !== '') {
      console.log("token :",this.token);
      const decodedToken = this.jwtHelper.decodeToken(this.token.split(',')[0]);
      console.log("decodedToken :",decodedToken);
      console.log("loggedInUsername :",decodedToken.sub);
      if(decodedToken && decodedToken.sub) {
        console.log("loggedInUsername :",decodedToken.sub);
        if(!this.jwtHelper.isTokenExpired(this.token.split(',')[0])) {
          console.log("loggedInUsername :",decodedToken.sub);
          this.loggedInUsername = decodedToken.sub;
          return true;
          }
      }
    }
    this.logOut();
    return false;
  }
  
 }