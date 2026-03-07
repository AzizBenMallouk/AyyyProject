import * as authUtils from './utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
    status: number;
    error: string;
    validationErrors?: Record<string, string>;

    constructor(status: number, message: string, error: string, validationErrors?: Record<string, string>) {
        super(message);
        this.status = status;
        this.error = error;
        this.validationErrors = validationErrors;
        this.name = 'ApiError';
    }
}

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        // Handle unauthorized (e.g., redirect to login or refresh token)
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            authUtils.removeToken();
            window.location.href = '/login';
        }
    }

    if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            errorData = {
                message: responseText || `An unexpected error occurred (HTTP ${response.status})`,
                error: `HTTP ${response.status} ${response.statusText}`
            };
        }

        throw new ApiError(
            response.status,
            errorData.message || 'API request failed',
            errorData.error || 'Unknown Error',
            errorData.validationErrors
        );
    }

    if (response.status === 204) return null;
    return response.json();
};

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const token = authUtils.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

const buildUrl = (path: string, params?: Record<string, any>) => {
    let url = path.startsWith('http') ? path : `${API_URL}${path}`;

    if (params) {
        const query = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&');

        if (query) {
            url += (url.includes('?') ? '&' : '?') + query;
        }
    }

    return url;
};

export const api = {
    get: async <T>(path: string, options?: RequestOptions): Promise<T> => {
        const response = await fetch(buildUrl(path, options?.params), {
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            method: 'GET',
        });
        return handleResponse(response);
    },

    post: async <T>(path: string, body: any, options?: RequestOptions): Promise<T> => {
        const response = await fetch(buildUrl(path, options?.params), {
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            method: 'POST',
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    put: async <T>(path: string, body: any, options?: RequestOptions): Promise<T> => {
        const response = await fetch(buildUrl(path, options?.params), {
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            method: 'PUT',
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    delete: async <T>(path: string, options?: RequestOptions): Promise<T> => {
        const response = await fetch(buildUrl(path, options?.params), {
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    patch: async <T>(path: string, body: any, options?: RequestOptions): Promise<T> => {
        const response = await fetch(buildUrl(path, options?.params), {
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            method: 'PATCH',
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    }
};
