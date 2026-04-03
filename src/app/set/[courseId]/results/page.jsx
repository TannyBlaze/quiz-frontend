"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../components/AuthGuard";
import { fetchWithAuth } from "../../../../services/api";
import { useToast } from "../../../../components/ToastProvider";

export default function ResultsPage() {
    const { courseId } = useParams();
    const { showToast } = useToast();

    const [results, setResults] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth(
                    `/courses/${courseId}/attempts`
                );
                setResults(Array.isArray(res) ? res : []);
            } catch {
                showToast("Failed to load results", "error");
                setResults([]);
            }
        };

        if (courseId) load();
    }, [courseId, showToast]);

    return (
        <AuthGuard allowedRoles={["setter"]}>
            <div className="p-6 bg-blue-50 min-h-screen">

                {/* HEADER */}
                <h1 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                    <i className="fa-solid fa-chart-column"></i>
                    Results Overview
                </h1>

                {/* EMPTY STATE */}
                {results.length === 0 ? (
                    <div className="text-center mt-20 text-gray-500">
                        <i className="fa-solid fa-chart-simple text-4xl mb-3"></i>
                        <p>No attempts yet</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((r, i) => {
                            const isGood = r.percentage >= 70;

                            return (
                                <div
                                    key={i}
                                    className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
                                >
                                    {/* USER */}
                                    <div className="mb-3">
                                        <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                            <i className="fa-solid fa-user"></i>
                                            {r.user}
                                        </h2>

                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <i className="fa-solid fa-envelope"></i>
                                            {r.email}
                                        </p>
                                    </div>

                                    {/* STATS */}
                                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                                        <p className="flex items-center gap-2">
                                            <i className="fa-solid fa-hashtag"></i>
                                            Attempt #{r.attempt_number || i + 1}
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <i className="fa-solid fa-check"></i>
                                            {r.score} / {r.total}
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <i className="fa-solid fa-percent"></i>
                                            {r.percentage}%
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <i className="fa-solid fa-clock"></i>
                                            {r.time_spent
                                                ? `${r.time_spent}s`
                                                : "N/A"}
                                        </p>
                                    </div>

                                    {/* PERFORMANCE BADGE */}
                                    <div
                                        className={`text-sm font-semibold px-3 py-1 rounded-full inline-flex items-center gap-2 ${isGood
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-500"
                                            }`}
                                    >
                                        <i
                                            className={`fa-solid ${isGood
                                                    ? "fa-fire"
                                                    : "fa-triangle-exclamation"
                                                }`}
                                        ></i>
                                        {isGood
                                            ? "Good Performance"
                                            : "Needs Improvement"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}