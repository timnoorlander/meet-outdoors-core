import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.getAccessToken(loginDto);
    return { access_token: token };
  }

  @Post('register')
  signUp(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
