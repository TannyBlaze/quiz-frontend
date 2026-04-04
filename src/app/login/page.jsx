"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/api";
import { useToast } from "../../components/ToastProvider";

export default function Login() {
    const router = useRouter();
    const { showToast } = useToast();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const redirectUser = useCallback((role) => {
        if (role === "admin") router.push("/admin");
        else if (role === "setter") router.push("/set");
        else router.push("/quiz");
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            const user = JSON.parse(storedUser);
            redirectUser(user.role);
        }
    }, [redirectUser]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            return showToast("All fields are required", "error");
        }

        setLoading(true);

        try {
            const res = await loginUser(form);

            if (res.token && res.user) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("user", JSON.stringify(res.user));

                showToast("Login successful", "success");
                redirectUser(res.user.role);
            } else {
                showToast(res.message || "Login failed", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Server error", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-80"
            >
                <h2 className="text-2xl mb-6 text-center font-bold text-blue-600 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    Login
                </h2>

                <div className="relative mb-4">
                    <i className="fa-solid fa-envelope absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full pl-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="relative mb-4">
                    <i className="fa-solid fa-lock absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-gray-500"
                    >
                        <i
                            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"
                                }`}
                        ></i>
                    </button>
                </div>

                <button
                    disabled={loading}
                    className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}