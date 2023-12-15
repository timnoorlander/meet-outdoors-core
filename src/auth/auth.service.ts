import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  register() {
    return { msg: 'I am signed up' };
  }

  login() {
    return { msg: 'I am logged in' };
  }
}
