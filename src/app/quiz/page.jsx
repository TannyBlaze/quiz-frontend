"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import { fetchWithAuth } from "../../services/api";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastProvider";

export default function QuizPage() {
    const [courses, setCourses] = useState([]);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth("/courses");
                setCourses(Array.isArray(res) ? res : []);
            } catch {
                showToast("Failed to load quizzes", "error");
                setCourses([]);
            }
        };
        load();
    }, [showToast]);

    return (
        <AuthGuard allowedRoles={["player"]}>
            <div className="p-6 bg-blue-50 min-h-screen">

                {/* HEADER */}
                <h1 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                    <i className="fa-solid fa-layer-group"></i>
                    Available Quizzes
                </h1>

                {/* EMPTY STATE */}
                {courses.length === 0 ? (
                    <div className="text-center mt-20 text-gray-500">
                        <i className="fa-solid fa-box-open text-4xl mb-3"></i>
                        <p>No quizzes available yet</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course._id}
                                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
                            >
                                {/* TITLE */}
                                <h2 className="font-semibold text-lg mb-2 text-gray-800">
                                    {course.title}
                                </h2>

                                {/* INFO */}
                                <div className="text-sm text-gray-600 space-y-1 mb-4">
                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-list"></i>
                                        {course.question_count} Questions
                                    </p>

                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-clock"></i>
                                        {course.timer}s Timer
                                    </p>
                                </div>

                                {/* ACTION */}
                                <button
                                    onClick={() =>
                                        router.push(`/quiz/${course._id}`)
                                    }
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-play"></i>
                                    Start Quiz
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}