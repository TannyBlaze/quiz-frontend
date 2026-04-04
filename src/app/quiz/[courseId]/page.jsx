"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { fetchWithAuth } from "../../../services/api";
import { useToast } from "../../../components/ToastProvider";

export default function QuizPlay() {
    const { courseId } = useParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [quiz, setQuiz] = useState(null);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);

    const [startTime, setStartTime] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetchWithAuth(`/courses/${courseId}/quiz`);

                if (res.message === "Max attempts reached") {
                    setError("You have used all your attempts for this quiz.");
                    return;
                }

                if (res.message) {
                    setError(res.message);
                    return;
                }

                setQuiz(res);
                setTimeLeft(res.timer ?? null);
                setStartTime(Date.now());
            } catch {
                setError("Failed to load quiz");
            }
        };

        if (courseId) init();
    }, [courseId]);

    const submitQuiz = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const timeSpent = startTime
                ? Math.floor((Date.now() - startTime) / 1000)
                : null;

            const res = await fetchWithAuth(`/courses/${courseId}/submit`, {
                method: "POST",
                body: JSON.stringify({
                    answers,
                    time_spent: timeSpent,
                }),
            });

            if (res.message === "Max attempts reached") {
                showToast("You cannot submit anymore", "error");
                return;
            }

            router.push(`/quiz/result?score=${res.score}&total=${res.total}`);
        } catch {
            showToast("Submission failed", "error");
        } finally {
            setSubmitting(false);
        }
    }, [answers, courseId, router, startTime, submitting, showToast]);

    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft <= 0) {
            if (quiz) submitQuiz();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, quiz, submitQuiz]);

    const selectAnswer = (index) => {
        const selected = quiz.questions[current].options[index];

        const updated = [...answers];

        updated[current] = {
            index: quiz.questions[current].index,
            value: selected,
        };

        setAnswers(updated);
    };

    if (error) {
        return (
            <AuthGuard allowedRoles={["player"]}>
                <div className="flex items-center justify-center min-h-screen bg-blue-50">
                    <div className="bg-white p-8 rounded-2xl shadow text-center">
                        <i className="fa-solid fa-ban text-red-500 text-3xl mb-3"></i>
                        <h1 className="text-xl font-bold mb-2 text-red-600">
                            Access Denied
                        </h1>
                        <p className="text-gray-600">{error}</p>

                        <button
                            onClick={() => router.push("/quiz")}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Back to Quizzes
                        </button>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    if (!quiz)
        return (
            <p className="p-6 text-center text-gray-500">Loading quiz...</p>
        );

    const q = quiz.questions[current];

    const progress =
        ((current + 1) / quiz.questions.length) * 100;

    return (
        <AuthGuard allowedRoles={["player"]}>
            <div className="min-h-screen bg-blue-50 p-6">

                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">
                        {quiz.title}
                    </h1>

                    {timeLeft !== null && (
                        <div className="flex items-center gap-2 text-red-500 font-semibold">
                            <i className="fa-solid fa-clock"></i>
                            {timeLeft}s
                        </div>
                    )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Question {current + 1} of {quiz.questions.length}
                </p>

                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="font-semibold text-lg mb-4">
                        {q.question}
                    </p>

                    {q.options.map((opt, i) => {
                        const selected =
                            answers[current]?.value === opt;

                        return (
                            <button
                                key={i}
                                onClick={() => selectAnswer(i)}
                                className={`w-full text-left p-3 mb-2 rounded-lg border transition ${selected
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "hover:bg-blue-50"
                                    }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        disabled={current === 0}
                        onClick={() => setCurrent(current - 1)}
                        className="bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Prev
                    </button>

                    {current === quiz.questions.length - 1 ? (
                        <button
                            onClick={submitQuiz}
                            disabled={submitting}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            <i className="fa-solid fa-check"></i>{" "}
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrent(current + 1)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Next <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}