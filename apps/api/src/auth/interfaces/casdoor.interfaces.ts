export interface CasdoorUser {
  sub: string;
  name: string;
  email: string;
}

export interface CasdoorToken {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}
