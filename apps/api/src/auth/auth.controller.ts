import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import express from 'express';
import { CasdoorUser } from '@ws-lab/shared';

@Controller('auth')
export class AuthController {
  private readonly webUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.webUrl = this.configService.getOrThrow<string>('WEB_URL');
  }

  @Get('login')
  login(@Res() res: express.Response) {
    const authUrl = this.authService.getAuthorizationUrl();
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: express.Response) {
    try {
      const tokenResponse = await this.authService.exchangeCodeForToken(code);

      res.cookie('access_token', tokenResponse.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });

      res.redirect(this.webUrl);
    } catch {
      throw new InternalServerErrorException('Casdoor Authorization error');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-info')
  getUserInfo(@Req() req: express.Request) {
    return req['user'] as CasdoorUser;
  }
}
