export interface Admin {
    _id: string;
    name: string;
    email: string;
  }
  
  export interface AuthState {
    admin?: Admin | null;
  }
  