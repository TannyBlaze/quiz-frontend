/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, allowedRoles = [] }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.replace("/login");
            return;
        }

        const user = JSON.parse(storedUser);

        if (
            allowedRoles.length &&
            user.role !== "admin" &&
            !allowedRoles.includes(user.role)
        ) {
            router.replace("/quiz");
            return;
        }

        setAuthorized(true);
    }, [router, allowedRoles]);

    if (!authorized) return null;

    return children;
}