/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "../services/api";
import { useEffect, useState } from "react";
import { useToast } from "./ToastProvider";

export default function Navbar() {
    const router = useRouter();
    const { showToast } = useToast();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ prevent hydration mismatch
    if (!mounted) return null;

    // ✅ SAFE: runs only on client AFTER mount
    let role = null;

    try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            role = JSON.parse(storedUser).role;
        }
    } catch {
        role = null;
    }

    const handleLogout = async () => {
        try {
            await logoutUser();
            showToast("Logged out successfully 👋", "success");
        } catch {
            showToast("Logout failed", "error");
        }

        router.replace("/login");
    };

    return (
        <div className="sticky top-0 z-50 backdrop-blur-md bg-blue-600/90 text-white px-6 py-3 flex justify-between items-center shadow-lg border-b border-white/10">

            {/* LOGO */}
            <h1
                onClick={() => router.push("/quiz")}
                className="font-bold text-xl cursor-pointer flex items-center gap-2 tracking-wide hover:opacity-90 transition"
            >
                <i className="fa-solid fa-bolt text-yellow-300"></i>
                Quiz App
            </h1>

            {/* NAV */}
            <div className="flex items-center gap-3 flex-wrap">

                {(role === "admin" || role === "player") && (
                    <button
                        onClick={() => router.push("/quiz")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <i className="fa-solid fa-gamepad"></i>
                        Quiz
                    </button>
                )}

                {(role === "admin" || role === "setter") && (
                    <>
                        <button
                            onClick={() => router.push("/set")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-all duration-200 hover:shadow-md active:scale-95"
                        >
                            <i className="fa-solid fa-folder"></i>
                            Courses
                        </button>

                        <button
                            onClick={() => router.push("/set/create")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-all duration-200 hover:shadow-md active:scale-95"
                        >
                            <i className="fa-solid fa-plus"></i>
                            Create
                        </button>
                    </>
                )}

                {role === "admin" && (
                    <button
                        onClick={() => router.push("/admin")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <i className="fa-solid fa-user-shield"></i>
                        Admin
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white/90 text-blue-600 px-4 py-2 rounded-xl hover:bg-white transition font-semibold shadow-sm hover:shadow-md active:scale-95"
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Logout
                </button>
            </div>
        </div>
    );
}