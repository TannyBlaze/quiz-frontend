"use client";

import { useSearchParams, useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { Suspense } from "react";

function ResultContent() {
    const params = useSearchParams();
    const router = useRouter();

    const score = Number(params.get("score") || 0);
    const total = Number(params.get("total") || 0);

    const percentage = total ? Math.round((score / total) * 100) : 0;

    let color = "text-red-500";
    let message = "Try again";
    let icon = "fa-face-frown";

    if (percentage >= 80) {
        color = "text-green-600";
        message = "You killed it!";
        icon = "fa-trophy";
    } else if (percentage >= 50) {
        color = "text-yellow-500";
        message = "Not bad!";
        icon = "fa-thumbs-up";
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md">

                <div className={`text-4xl mb-3 ${color}`}>
                    <i className={`fa-solid ${icon}`}></i>
                </div>

                <h1 className="text-2xl font-bold mb-4 text-blue-600">
                    Quiz Result
                </h1>

                <p className="text-3xl font-bold text-gray-800">
                    {score} / {total}
                </p>

                <p className={`text-xl font-semibold mt-2 ${color}`}>
                    {percentage}%
                </p>

                <p className={`mt-3 font-medium ${color}`}>
                    {message}
                </p>

                <div className="mt-6 flex gap-3 justify-center">
                    <button
                        onClick={() => router.push("/quiz")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-rotate"></i>
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <AuthGuard allowedRoles={["admin", "player"]}>
            <Suspense fallback={<p className="text-center mt-10">Loading result...</p>}>
                <ResultContent />
            </Suspense>
        </AuthGuard>
    );
}