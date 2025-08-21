export interface UserCredentials {
  identifier: string; // Changed to match login payload
  password: string;
}

export interface AuthResponse {
  access_token: string; // Changed from token to access_token
  user: {
    id: number;
    nombre: string; // Changed from username to nombre
    role: string;
  };
}