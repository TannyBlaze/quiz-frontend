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
                window.dispatchEvent(new Event("userChanged"));

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
        <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl"
            >
                <h2 className="text-3xl mb-8 text-center font-bold text-blue-600 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    Login
                </h2>

                <div className="relative mb-5">
                    <i className="fa-solid fa-envelope absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="relative mb-6">
                    <i className="fa-solid fa-lock absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-500"
                    >
                        <i
                            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                        ></i>
                    </button>
                </div>

                <button
                    disabled={loading}
                    className="bg-blue-600 text-white w-full p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-sm text-center mt-6 text-gray-600">
                    Don&apos;t have an account?{" "}
                    <span
                        onClick={() => router.push("/register")}
                        className="text-blue-600 font-semibold cursor-pointer hover:underline"
                    >
                        Register
                    </span>
                </p>
            </form>
        </div>
    );
}