"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../services/api";
import { useToast } from "../../components/ToastProvider";

export default function Register() {
    const router = useRouter();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password) {
            return showToast("All fields are required", "error");
        }

        if (form.password !== form.confirmPassword) {
            return showToast("Passwords do not match", "error");
        }

        setLoading(true);

        try {
            const res = await registerUser(form);

            if (res.token && res.user) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("user", JSON.stringify(res.user));

                showToast("Registered successfully 🚀", "success");
                router.push("/quiz");
            } else {
                showToast(res.message || "Registration failed", "error");
            }
        } catch (error) {
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
                {/* TITLE */}
                <h2 className="text-2xl mb-6 text-center font-bold text-blue-600 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-user-plus"></i>
                    Register
                </h2>

                {/* NAME */}
                <div className="relative mb-4">
                    <i className="fa-solid fa-user absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="name"
                        placeholder="Name"
                        onChange={handleChange}
                        className="w-full pl-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* EMAIL */}
                <div className="relative mb-4">
                    <i className="fa-solid fa-envelope absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full pl-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* PASSWORD */}
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

                {/* CONFIRM PASSWORD */}
                <div className="relative mb-4">
                    <i className="fa-solid fa-lock absolute top-3 left-3 text-gray-400"></i>
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        className="w-full pl-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* BUTTON */}
                <button
                    disabled={loading}
                    className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-user-check"></i>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}