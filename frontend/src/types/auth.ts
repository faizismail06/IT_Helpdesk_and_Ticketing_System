export type RoleName = 'EMPLOYEE' | 'HELPDESK' | 'TECHNICIAN' | 'ADMIN';

export interface Department {
 id: string;
 name: string;
 code: string;
}

export interface User {
 id: string;
 email: string;
 fullName: string;
 avatarUrl?: string | null;
 role: RoleName;
 isActive: boolean;
 department: Department;
 createdAt: string;
}

export interface AuthState {
 user: User | null;
 token: string | null;
 isAuthenticated: boolean;
 isLoading: boolean;
}
