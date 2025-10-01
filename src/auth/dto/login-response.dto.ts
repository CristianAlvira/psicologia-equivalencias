export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: number;
    nombres: string;
    email: string;
    roles: string[];
    permisos: string[];
  };
}
