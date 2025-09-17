// Tipos para a integração com backend de carteiras

export interface CarteiraOption {
  value: string;
  label: string;
}

export interface CarteirasResponse {
  success: boolean;
  carteiras: string[];
  source: "salesforce" | "database";
  error?: string;
}

export interface CarteiraApiError {
  success: false;
  error: string;
  carteiras: never[];
}

export interface CarteiraApiSuccess {
  success: true;
  carteiras: string[];
  source: "salesforce" | "database";
}

export type CarteiraApiResponse = CarteiraApiSuccess | CarteiraApiError;
