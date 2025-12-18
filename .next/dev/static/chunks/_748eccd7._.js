(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
class ApiClient {
    baseURL;
    constructor(baseURL){
        // Use environment variable or default to your API endpoint
        this.baseURL = baseURL || ("TURBOPACK compile-time value", "https://mjzctqcx-3000.asse.devtunnels.ms/") || 'https://mjzctqcx-3000.asse.devtunnels.ms';
    }
    getToken() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem('authToken');
    }
    buildURL(endpoint, params) {
        const url = new URL(endpoint, this.baseURL);
        if (params) {
            Object.entries(params).forEach(([key, value])=>{
                url.searchParams.append(key, String(value));
            });
        }
        return url.toString();
    }
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');
        let data;
        try {
            data = isJson ? await response.json() : await response.text();
            console.log('[API Client] Response data:', data);
        } catch (error) {
            console.error('[API Client] Failed to parse response:', error);
            throw new Error('Failed to parse response');
        }
        if (!response.ok) {
            // Handle tRPC error format
            let errorMessage;
            if (isJson && data?.error) {
                // tRPC error format: { error: { message, code, data } }
                errorMessage = typeof data.error === 'string' ? data.error : data.error?.message || 'An error occurred';
            } else if (isJson && data?.message) {
                errorMessage = typeof data.message === 'string' ? data.message : 'An error occurred';
            } else {
                errorMessage = typeof data === 'string' ? data : `HTTP error! status: ${response.status}`;
            }
            return {
                success: false,
                error: errorMessage,
                message: errorMessage
            };
        }
        // Handle tRPC success response format
        // tRPC returns: { result: { data: {...} } } or { result: { data: { users: [], pagination: {} } } }
        let responseData = data;
        if (isJson && data?.result?.data) {
            // tRPC format: { result: { data: {...} } }
            responseData = data.result.data;
        } else if (isJson && data?.data) {
            // Direct data format
            responseData = data.data;
        } else if (isJson && Array.isArray(data)) {
            // Array response
            responseData = data;
        }
        console.log('[API Client] Extracted response data:', responseData);
        return {
            success: true,
            data: responseData,
            ...isJson && data.message && {
                message: typeof data.message === 'string' ? data.message : undefined
            }
        };
    }
    async request(endpoint, options = {}) {
        const { params, headers = {}, ...fetchOptions } = options;
        const url = this.buildURL(endpoint, params);
        const token = this.getToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...token && {
                Authorization: `Bearer ${token}`
            },
            ...headers
        };
        try {
            console.log('[API Client] Making request to:', url);
            console.log('[API Client] Request body:', fetchOptions.body);
            console.log('[API Client] Request headers:', defaultHeaders);
            const response = await fetch(url, {
                ...fetchOptions,
                headers: defaultHeaders
            });
            console.log('[API Client] Response status:', response.status);
            console.log('[API Client] Response ok:', response.ok);
            return this.handleResponse(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage
            };
        }
    }
    async get(endpoint, options) {
        return this.request(endpoint, {
            ...options,
            method: 'GET'
        });
    }
    async post(endpoint, data, options) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }
    async put(endpoint, data, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }
    async patch(endpoint, data, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        });
    }
    async delete(endpoint, options) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }
}
const apiClient = new ApiClient();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authService",
    ()=>authService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/client.ts [app-client] (ecmascript)");
;
class AuthService {
    async login(credentials) {
        try {
            // tRPC endpoint format: /api/trpc/[procedure]
            // Try direct JSON format first (most common tRPC format)
            console.log('[Auth Service] Calling login API with:', credentials);
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/api/trpc/admin.auth.login', credentials);
            console.log('[Auth Service] API Response:', response);
            if (response.success && response.data) {
                // Handle tRPC response - data might be nested
                const loginData = response.data;
                // Extract token and user from response
                // Adjust these based on your actual API response structure
                const token = loginData.token || loginData.accessToken || loginData.access_token;
                const user = loginData.user || loginData;
                if (token && user && ("TURBOPACK compile-time value", "object") !== 'undefined') {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('adminUser', JSON.stringify({
                        id: user.id || user._id || '',
                        email: user.email || credentials.email,
                        role: user.role || 'admin',
                        name: user.name || user.username || ''
                    }));
                    if (loginData.expiresIn) {
                        const expirationTime = Date.now() + loginData.expiresIn * 1000;
                        localStorage.setItem('tokenExpiration', expirationTime.toString());
                    }
                }
                return {
                    success: true,
                    data: {
                        token: token || '',
                        user: {
                            id: user.id || user._id || '',
                            email: user.email || credentials.email,
                            role: user.role || 'admin',
                            name: user.name || user.username
                        },
                        expiresIn: loginData.expiresIn
                    },
                    message: 'Login successful'
                };
            }
            // Extract error message properly
            const errorMsg = typeof response.error === 'string' ? response.error : typeof response.error === 'object' && response.error?.message ? response.error.message : typeof response.message === 'string' ? response.message : 'Login failed';
            return {
                success: false,
                error: errorMsg,
                message: errorMsg
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage
            };
        }
    }
    logout() {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('tokenExpiration');
        }
    }
    /**
   * Get current user from storage
   */ getCurrentUser() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const userStr = localStorage.getItem('adminUser');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch  {
            return null;
        }
    }
    /**
   * Get auth token from storage
   */ getToken() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem('authToken');
    }
    /**
   * Check if token is expired
   */ isTokenExpired() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const expiration = localStorage.getItem('tokenExpiration');
        if (!expiration) return false // No expiration set, assume valid
        ;
        return Date.now() > parseInt(expiration, 10);
    }
    /**
   * Verify token with backend (optional - for token validation)
   */ async verifyToken() {
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/auth/verify');
            return response.success && response.data?.valid === true;
        } catch  {
            return false;
        }
    }
}
const authService = new AuthService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [adminUser, setAdminUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isChecking, setIsChecking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkAuth = {
                "AuthProvider.useEffect.checkAuth": async ()=>{
                    const token = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].getToken();
                    const user = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].getCurrentUser();
                    if (token && user && !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].isTokenExpired()) {
                        setAdminUser(user);
                        setIsAuthenticated(true);
                    } else {
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].isTokenExpired()) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].logout();
                        }
                        setIsAuthenticated(false);
                        setAdminUser(null);
                        if (!pathname?.includes("/login")) {
                            router.push("/login");
                        }
                    }
                    setIsChecking(false);
                }
            }["AuthProvider.useEffect.checkAuth"];
            checkAuth();
        }
    }["AuthProvider.useEffect"], [
        pathname,
        router
    ]);
    const logout = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].logout();
        setIsAuthenticated(false);
        setAdminUser(null);
        router.push("/login");
    };
    if (isChecking) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-pulse text-muted-foreground",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/components/auth-context.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/auth-context.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            isAuthenticated,
            adminUser,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/auth-context.tsx",
        lineNumber: 67,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "MxRiMEaFSl6csIO8NYDSOOQWRMg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_748eccd7._.js.map