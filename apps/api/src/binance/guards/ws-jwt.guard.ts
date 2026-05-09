import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const rawCookies = client.handshake.headers.cookie;

      if (!rawCookies) {
        this.logger.error('WS Authentication failed: No cookies provided');
        return false;
      }

      const cookies = cookie.parse(rawCookies);
      const token = cookies['access_token'];

      if (!token) {
        this.logger.error(
          'WS Authentication failed: Access token missing in cookies',
        );
        return false;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;

      return true;
    } catch (err) {
      this.logger.error(`WS Auth Error: ${err}`);
      throw new WsException('Unauthorized access');
    }
  }
}
