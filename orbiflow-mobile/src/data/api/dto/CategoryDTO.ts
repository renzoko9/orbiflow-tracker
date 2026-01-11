export interface CategoryResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    isGlobal: boolean;
    createdAt: string;
  };
}

export interface CategoryListResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: Array<{
    id: number;
    name: string;
    icon?: string;
    color?: string;
    isGlobal: boolean;
    createdAt: string;
  }>;
}
