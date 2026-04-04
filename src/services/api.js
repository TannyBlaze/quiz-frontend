const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const getToken = () => {
    return localStorage.getItem("token");
};

export const getId = (item) => {
    if (!item?._id) return Math.random().toString();

    if (typeof item._id === "object") {
        return item._id.$oid;
    }

    return item._id;
};

export const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();

    try {
        const res = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            }
        });

        const text = await res.text();

        try {
            return JSON.parse(text);
        } catch (err) {
            console.error("Not JSON response:", text);
            throw new Error("Server did not return JSON");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
};

export const registerUser = async (data) => {
    const res = await fetchWithAuth("/register", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
    }

    return res;
};

export const loginUser = async (data) => {
    const res = await fetchWithAuth("/login", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
    }

    return res;
};

export const getUser = async () => {
    return await fetchWithAuth("/user", {
        method: "GET",
    });
};

export const logoutUser = async () => {
    const res = await fetchWithAuth("/logout", {
        method: "POST",
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return res;
};