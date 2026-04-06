"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../../../services/api";
import AuthGuard from "../../../components/AuthGuard";
import { useToast } from "../../../components/ToastProvider";

export default function CreateCourse() {
    const [title, setTitle] = useState("");
    const [questionCount, setQuestionCount] = useState(10);
    const [loading, setLoading] = useState(false);

    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(0);

    const router = useRouter();
    const { showToast } = useToast();

    const createCourse = async () => {
        if (!title) {
            return showToast("Title is required", "error");
        }

        setLoading(true);

        try {
            await fetchWithAuth("/courses", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    timer: hours * 3600 + minutes * 60 + seconds,
                    question_count: questionCount,
                    questions: [],
                }),
            });

            showToast("Quiz created successfully", "success");
            router.push("/set");
        } catch {
            showToast("Failed to create quiz", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard allowedRoles={["setter"]}>
            <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">

                <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

                    <h1 className="text-xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                        <i className="fa-solid fa-plus"></i>
                        Create Quiz
                    </h1>

                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Quiz Title</label>
                        <div className="relative mt-1">
                            <i className="fa-solid fa-heading absolute top-3 left-3 text-gray-400"></i>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter quiz title"
                                className="w-full pl-10 p-2 border rounded-lg focus:outline-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Timer</label>

                        <div className="flex gap-2 mt-1">
                            <div className="w-1/3">
                                <label className="text-xs text-gray-500">Hours</label>
                                <input
                                    type="number"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div className="w-1/3">
                                <label className="text-xs text-gray-500">Minutes</label>
                                <input
                                    type="number"
                                    value={minutes}
                                    onChange={(e) => setMinutes(Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div className="w-1/3">
                                <label className="text-xs text-gray-500">Seconds</label>
                                <input
                                    type="number"
                                    value={seconds}
                                    onChange={(e) => setSeconds(Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-sm text-gray-600">Question Limit</label>
                        <div className="relative mt-1">
                            <i className="fa-solid fa-list-ol absolute top-3 left-3 text-gray-400"></i>
                            <input
                                type="number"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full pl-10 p-2 border rounded-lg focus:outline-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={createCourse}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Creating...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-plus"></i>
                                Create Quiz
                            </>
                        )}
                    </button>

                </div>
            </div>
        </AuthGuard>
    );
}