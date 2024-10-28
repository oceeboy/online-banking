declare namespace Express {
  export interface Request {
    user?: {
      email: string;
      sub: string; // Typically the user ID
      roles: string[]; // Roles (e.g., ['user', 'admin'])
    };
  }
}
