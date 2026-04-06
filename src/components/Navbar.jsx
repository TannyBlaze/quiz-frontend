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
    const [menuOpen, setMenuOpen] = useState(false);

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
        setMenuOpen(false);
    };

    const navigate = (path) => {
        router.push(path);
        setMenuOpen(false);
    };

    const renderNavButtons = () => (
        <>
            {userName && (
                <div className="px-3 py-2 rounded-xl bg-white/10 text-sm font-medium flex items-center gap-2">
                    <i className="fa-solid fa-user"></i>
                    {userName}
                </div>
            )}

            {(role === "admin" || role === "player") && (
                <button
                    onClick={() => navigate("/quiz")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition"
                >
                    <i className="fa-solid fa-gamepad"></i>
                    Quiz
                </button>
            )}

            {(role === "admin" || role === "setter") && (
                <>
                    <button
                        onClick={() => navigate("/set")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition"
                    >
                        <i className="fa-solid fa-folder"></i>
                        Courses
                    </button>

                    <button
                        onClick={() => navigate("/set/create")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Create
                    </button>
                </>
            )}

            {role === "admin" && (
                <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition"
                >
                    <i className="fa-solid fa-user-shield"></i>
                    Admin
                </button>
            )}

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/90 text-blue-600 px-4 py-2 rounded-xl hover:bg-white transition font-semibold"
            >
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
            </button>
        </>
    );

    return (
        <div className="sticky top-0 z-50 backdrop-blur-md bg-blue-600/90 text-white px-4 md:px-6 py-3 shadow-lg border-b border-white/10">
            <div className="flex justify-between items-center">
                <h1
                    onClick={() => navigate("/quiz")}
                    className="font-bold text-lg md:text-xl cursor-pointer flex items-center gap-2"
                >
                    <i className="fa-solid fa-brain"></i>
                    TBQOptions
                </h1>

                <div className="hidden md:flex items-center gap-3">
                    {renderNavButtons()}
                </div>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-xl"
                >
                    <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
                </button>
            </div>

            {menuOpen && (
                <div className="mt-4 flex flex-col gap-3 md:hidden bg-white/10 p-4 rounded-xl backdrop-blur">
                    {renderNavButtons()}
                </div>
            )}
        </div>
    );
}