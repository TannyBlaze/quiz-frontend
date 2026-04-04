"use client";

import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <div
            className={`${colors[type]} text-white px-4 py-3 rounded shadow-lg flex items-center gap-2`}
        >
            <i
                className={`fa ${type === "success"
                        ? "fa-check-circle"
                        : type === "error"
                            ? "fa-times-circle"
                            : "fa-info-circle"
                    }`}
            ></i>

            <span>{message}</span>
        </div>
    );
}