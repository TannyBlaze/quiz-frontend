"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { fetchWithAuth } from "../../../services/api";
import { useToast } from "../../../components/ToastProvider";
import { useRouter } from "next/navigation";

export default function CourseDetails() {
    const { courseId } = useParams();
    const { showToast } = useToast();
    const [attemptMode, setAttemptMode] = useState("unlimited");
    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const loadCourse = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const res = await fetchWithAuth(`/courses/${courseId}`);

            const formatted = {
                ...res,
                max_attempts: res.max_attempts ?? "",
            };

            setCourse(formatted);

            setInitialData(JSON.stringify({
                ...formatted,
                questions: formatted.questions || []
            }));

            setAttemptMode(
                res.max_attempts === null || res.max_attempts === undefined
                    ? "unlimited"
                    : "limited"
            );

            setQuestions(res.questions || []);
        } catch {
            showToast("Failed to load course", "error");
        }
    }, [courseId, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const token = localStorage.getItem("token");

            if (!courseId || !token) return;

            loadCourse();
        }, 300);

        return () => clearTimeout(timer);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const hasChanges = () => {
        const currentData = JSON.stringify({
            ...course,
            questions
        });
        return currentData !== initialData;
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowModal(true);
        } else {
            router.push("/set");
        }
    };

    const confirmLeave = () => {
        setShowModal(false);
        router.push("/set");
    };

    const saveAndLeave = async () => {
        await saveChanges();
        setShowModal(false);
        router.push("/set");
    };

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            { question: "", options: ["", "", "", ""], correct: "" }
        ]);
    };

    const updateQuestion = (i, value) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[i].question = value;
            return updated;
        });
    };

    const updateOption = (qi, oi, value) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qi].options[oi] = value;
            return updated;
        });
    };

    const updateCorrect = (i, value) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[i].correct = value;
            return updated;
        });
    };

    const deleteQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
        showToast("Question removed", "info");
    };

    const saveChanges = async () => {
        if (!course.title.trim()) {
            showToast("Title cannot be empty", "error");
            return;
        }

        try {
            await fetchWithAuth(`/courses/${courseId}`, {
                method: "PUT",
                body: JSON.stringify({
                    title: course.title,
                    questions,
                    timer: course.timer,
                    question_count: course.question_count,
                    max_attempts:
                        course.max_attempts === ""
                            ? null
                            : Number(course.max_attempts),
                }),
            });

            setInitialData(JSON.stringify({
                ...course,
                questions
            }));

            showToast("Changes saved successfully", "success");
        } catch {
            showToast("Failed to save changes", "error");
        }
    };

    if (!course)
        return (
            <p className="p-6 text-center text-gray-500">
                Loading...
            </p>
        );

    return (
        <AuthGuard allowedRoles={["setter"]}>
            <div className="p-6 bg-blue-50 min-h-screen">

                <div className="sticky top-16 z-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-2 sm:px-0">

                    <button
                        onClick={handleBack}
                        className="w-full sm:w-auto bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Courses
                    </button>

                    <button
                        onClick={saveChanges}
                        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-floppy-disk"></i>
                        Save Changes
                    </button>

                </div>

                <div className="mt-4">

                <input
                    value={course.title}
                    onChange={(e) =>
                        setCourse(prev => ({
                            ...prev,
                            title: e.target.value
                        }))
                    }
                    className="text-2xl font-bold mb-6 text-blue-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                />

                <div className="bg-white p-5 rounded-2xl shadow mb-6">
                    <h2 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <i className="fa-solid fa-gear"></i>
                        Quiz Settings
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4 items-stretch">

                        <div className="flex flex-col justify-between">
                            <label className="text-sm text-gray-600 mb-1">Timer</label>

                            <div className="flex gap-2">

                                <div className="flex-1">
                                    <label className="text-xs text-gray-500">Hours</label>
                                    <input
                                        type="number"
                                        value={Math.floor((course.timer || 0) / 3600)}
                                        onChange={(e) => {
                                            const hours = Number(e.target.value);
                                            const minutes = Math.floor((course.timer % 3600) / 60);
                                            const seconds = course.timer % 60;

                                            setCourse(prev => ({
                                                ...prev,
                                                timer: hours * 3600 + minutes * 60 + seconds
                                            }));
                                        }}
                                        className="w-full border p-2 rounded-lg"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="text-xs text-gray-500">Minutes</label>
                                    <input
                                        type="number"
                                        value={Math.floor((course.timer % 3600) / 60)}
                                        onChange={(e) => {
                                            const hours = Math.floor((course.timer || 0) / 3600);
                                            const minutes = Number(e.target.value);
                                            const seconds = course.timer % 60;

                                            setCourse(prev => ({
                                                ...prev,
                                                timer: hours * 3600 + minutes * 60 + seconds
                                            }));
                                        }}
                                        className="w-full border p-2 rounded-lg"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="text-xs text-gray-500">Seconds</label>
                                    <input
                                        type="number"
                                        value={course.timer % 60}
                                        onChange={(e) => {
                                            const hours = Math.floor((course.timer || 0) / 3600);
                                            const minutes = Math.floor((course.timer % 3600) / 60);
                                            const seconds = Number(e.target.value);

                                            setCourse(prev => ({
                                                ...prev,
                                                timer: hours * 3600 + minutes * 60 + seconds
                                            }));
                                        }}
                                        className="w-full border p-2 rounded-lg"
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col justify-between">
                            <label className="text-sm text-gray-600 mb-1">Question Limit</label>
                            <input
                                type="number"
                                value={course.question_count || ""}
                                onChange={(e) =>
                                    setCourse(prev => ({
                                        ...prev,
                                        question_count: Number(e.target.value),
                                    }))
                                }
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>

                        <div className="flex flex-col justify-between">
                            <label className="text-sm text-gray-600 mb-2">Max Attempts</label>

                            <div className="flex items-center gap-6 mb-2">

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="attemptMode"
                                        checked={attemptMode === "unlimited"}
                                        onChange={() => {
                                            setAttemptMode("unlimited");
                                            setCourse(prev => ({
                                                ...prev,
                                                max_attempts: "",
                                            }));
                                        }}
                                        className="hidden"
                                    />

                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition
                                            ${attemptMode === "unlimited"
                                            ? "border-blue-600"
                                            : "border-gray-400"}
                                        `}>
                                        {attemptMode === "unlimited" && (
                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                        )}
                                    </div>

                                    <span className="text-sm text-gray-700">Unlimited</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="attemptMode"
                                        checked={attemptMode === "limited"}
                                        onChange={() => {
                                            setAttemptMode("limited");
                                            setCourse(prev => ({
                                                ...prev,
                                                max_attempts: prev.max_attempts || 1,
                                            }));
                                        }}
                                        className="hidden"
                                    />

                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition
                                            ${attemptMode === "limited"
                                            ? "border-blue-600"
                                            : "border-gray-400"}
                                        `}>
                                        {attemptMode === "limited" && (
                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                        )}
                                    </div>

                                    <span className="text-sm text-gray-700">Limited</span>
                                </label>

                            </div>

                            <input
                                type="number"
                                disabled={attemptMode === "unlimited"}
                                value={course.max_attempts}
                                onChange={(e) =>
                                    setCourse(prev => ({
                                        ...prev,
                                        max_attempts: e.target.value,
                                    }))
                                }
                                placeholder="Enter max attempts"
                                className={`w-full border p-2 rounded-lg ${attemptMode === "unlimited"
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                    }`}
                            />
                        </div>

                    </div>
                </div>

                {questions.map((q, i) => (
                    <div
                        key={i}
                        className="bg-white p-5 rounded-2xl shadow mb-6"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-700">
                                Question {i + 1}
                            </h3>

                            <button
                                onClick={() => deleteQuestion(i)}
                                className="text-red-500 hover:text-red-600 flex items-center gap-1"
                            >
                                <i className="fa-solid fa-trash"></i>
                                Delete
                            </button>
                        </div>

                        <input
                            value={q.question}
                            onChange={(e) =>
                                updateQuestion(i, e.target.value)
                            }
                            placeholder="Enter question"
                            className="border p-2 w-full mb-3 rounded-lg"
                        />

                        <div className="grid md:grid-cols-2 gap-2">
                            {q.options.map((opt, j) => (
                                <input
                                    key={j}
                                    value={opt}
                                    onChange={(e) =>
                                        updateOption(i, j, e.target.value)
                                    }
                                    placeholder={`Option ${j + 1}`}
                                    className="border p-2 rounded-lg"
                                />
                            ))}
                        </div>

                        <input
                            value={q.correct}
                            onChange={(e) =>
                                updateCorrect(i, e.target.value)
                            }
                            placeholder="Correct Answer"
                            className="border p-2 w-full mt-3 rounded-lg focus:outline-green-500"
                        />
                    </div>
                ))}

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={addQuestion}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Add Question
                    </button>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Unsaved Changes
                            </h3>

                            <p className="text-gray-600 mb-5">
                                You have unsaved changes. Are you sure you want to leave?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmLeave}
                                    className="px-4 py-2 rounded-lg bg-red-500 text-white"
                                >
                                    Leave
                                </button>

                                <button
                                    onClick={saveAndLeave}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                                >
                                    Save & Leave
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}