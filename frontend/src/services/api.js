import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// If the token is expired/invalid, sign the user out and go to /login.
// Login/register requests are skipped so their "wrong password" 401s
// still show normally on the form.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.startsWith("/auth/");

        if (
            error.response?.status === 401 &&
            !isAuthRequest &&
            localStorage.getItem("token")
        ) {
            localStorage.removeItem("token");

            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;