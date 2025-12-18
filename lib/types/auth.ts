export interface LoginRequest {
    email: string
    password: string
}


export interface LoginResponse {
    success: boolean
    data?: {
        token: string
        user: {
            id: string
            email: string
            role: string
            name?: string
        }
        expiresIn?: number
    }
    message?: string
    error?: string
}

export interface User {
    id: string
    email: string
    role: string
    name?: string
}


export interface AuthState {
    token: string | null
    user: User | null
    isAuthenticated: boolean
}

export interface ApiError {
    message: string
    status?: number
    code?: string
}
