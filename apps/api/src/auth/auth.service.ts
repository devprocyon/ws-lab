import { Injectable } from '@nestjs/common';
import { TokenResponse } from './interfaces/casdoor.interfaces';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly casdoorInternalUrl: string;
  private readonly casdoorExternalUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly applicationName: string;

  constructor(private configService: ConfigService) {
    this.casdoorInternalUrl = this.configService.getOrThrow(
      'CASDOOR_INTERNAL_URL',
    );
    this.casdoorExternalUrl = this.configService.getOrThrow(
      'CASDOOR_EXTERNAL_URL',
    );
    this.clientId = this.configService.getOrThrow('CASDOOR_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow('CASDOOR_CLIENT_SECRET');
    this.redirectUri = this.configService.getOrThrow('CASDOOR_REDIRECT_URI');
    this.applicationName = this.configService.getOrThrow('CASDOOR_APP_NAME');
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read profile',
      state: this.applicationName,
    });
    return `${this.casdoorExternalUrl}/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(
      `${this.casdoorInternalUrl}/api/login/oauth/access_token`,
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
        },
      },
    );
    return response.data;
  }
}
