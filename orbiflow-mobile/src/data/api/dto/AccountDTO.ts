// DTO que viene del backend
export interface AccountResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: {
    id: number;
    name: string;
    balance: string; // Viene como string del backend
    description?: string;
    createdAt: string;
  };
}

export interface AccountListResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: Array<{
    id: number;
    name: string;
    balance: string;
    description?: string;
    createdAt: string;
  }>;
}
