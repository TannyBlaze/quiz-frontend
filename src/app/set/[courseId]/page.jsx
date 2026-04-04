"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { fetchWithAuth } from "../../../services/api";
import { useToast } from "../../../components/ToastProvider";

export default function CourseDetails() {
    const { courseId } = useParams();
    const { showToast } = useToast();

    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);

    // FIXED: useCallback
    const loadCourse = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const res = await fetchWithAuth(`/courses/${courseId}`);

            setCourse({
                ...res,
                max_attempts: res.max_attempts ?? "",
            });

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
    }, [courseId, loadCourse]);

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
        try {
            await fetchWithAuth(`/courses/${courseId}`, {
                method: "PUT",
                body: JSON.stringify({
                    questions,
                    timer: course.timer,
                    question_count: course.question_count,
                    max_attempts:
                        course.max_attempts === ""
                            ? null
                            : Number(course.max_attempts),
                }),
            });

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

                <h1 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                    <i className="fa-solid fa-pen-to-square"></i>
                    {course.title}
                </h1>

                <div className="bg-white p-5 rounded-2xl shadow mb-6">
                    <h2 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <i className="fa-solid fa-gear"></i>
                        Quiz Settings
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        <input
                            type="number"
                            value={course.timer || 0}
                            onChange={(e) =>
                                setCourse((prev) => ({
                                    ...prev,
                                    timer: Number(e.target.value),
                                }))
                            }
                            placeholder="Timer (seconds)"
                            className="border p-2 rounded-lg focus:outline-blue-500"
                        />

                        <input
                            type="number"
                            value={course.question_count || ""}
                            onChange={(e) =>
                                setCourse((prev) => ({
                                    ...prev,
                                    question_count: Number(e.target.value),
                                }))
                            }
                            placeholder="Question limit"
                            className="border p-2 rounded-lg focus:outline-blue-500"
                        />

                        <input
                            type="number"
                            value={course.max_attempts}
                            onChange={(e) =>
                                setCourse((prev) => ({
                                    ...prev,
                                    max_attempts: e.target.value,
                                }))
                            }
                            placeholder="Max attempts"
                            className="border p-2 rounded-lg focus:outline-blue-500"
                        />
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

                    <button
                        onClick={saveChanges}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-floppy-disk"></i>
                        Save Changes
                    </button>
                </div>
            </div>
        </AuthGuard>
    );
}