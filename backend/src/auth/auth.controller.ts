import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const data = await this.authService.register(body);
    
    // Set cookie on response
    response.cookie('token', data.token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
      sameSite: 'lax',
    });

    return data;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const data = await this.authService.login(body);

    // Set cookie on response
    response.cookie('token', data.token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
      sameSite: 'lax',
    });

    return data;
  }
}
