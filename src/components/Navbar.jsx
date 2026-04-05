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
    const [userName, setUserName] = useState("");
    const [role, setRole] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setRole(parsed.role || null);
                setUserName(parsed.name || "");
            }
        } catch {
            setRole(null);
            setUserName("");
        }
    }, []);

    if (!mounted) return null;

    const handleLogout = async () => {
        try {
            await logoutUser();
            showToast("Logged out successfully", "success");
        } catch {
            showToast("Logout failed", "error");
        }

        router.replace("/login");
    };

    return (
        <div className="sticky top-0 z-50 backdrop-blur-md bg-blue-600/90 text-white px-6 py-3 flex justify-between items-center shadow-lg border-b border-white/10">

            <h1
                onClick={() => router.push("/quiz")}
                className="font-bold text-xl cursor-pointer flex items-center gap-2 tracking-wide hover:opacity-90 transition"
            >
                <i className="fa-solid fa-bolt text-yellow-300"></i>
                Quiz App
            </h1>

            <div className="flex items-center gap-3 flex-wrap">

                {userName && (
                    <div className="px-3 py-2 rounded-xl bg-white/10 text-sm font-medium flex items-center gap-2">
                        <i className="fa-solid fa-user"></i>
                        {userName}
                    </div>
                )}

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