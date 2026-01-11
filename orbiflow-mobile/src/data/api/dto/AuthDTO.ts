export interface AuthResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      name: string;
      createdAt: string;
    };
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

export interface RefreshTokenResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: {
    access: string;
    refresh: string;
  };
}

export interface UserResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: {
    id: number;
    email: string;
    name: string;
    createdAt: string;
  };
}
