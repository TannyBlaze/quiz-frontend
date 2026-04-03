"use client";

import Navbar from "../components/Navbar";
import ToastProvider from "./ToastProvider";

export default function ClientLayout({ children }) {
    return (
        <ToastProvider>
            <Navbar />
            {children}
        </ToastProvider>
    );
}