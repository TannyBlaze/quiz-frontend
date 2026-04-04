"use client";

import { useEffect, useState, useCallback } from "react";
import AuthGuard from "../../components/AuthGuard";
import { fetchWithAuth } from "../../services/api";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastProvider";

export default function SetPage() {
    const [courses, setCourses] = useState([]);
    const router = useRouter();
    const { showToast } = useToast();

    const loadCourses = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const res = await fetchWithAuth("/courses");
            setCourses(Array.isArray(res) ? res : []);
        } catch {
            showToast("Failed to load courses", "error");
            setCourses([]);
        }
    }, [showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCourses();
        }, 150);

        return () => clearTimeout(timer);
    }, [loadCourses]);

    const toggleAccess = async (id) => {
        try {
            await fetchWithAuth(`/courses/${id}/toggle`, { method: "PATCH" });
            showToast("Access updated", "success");
            loadCourses();
        } catch {
            showToast("Failed to update access", "error");
        }
    };

    const deleteCourse = async (id) => {
        try {
            await fetchWithAuth(`/courses/${id}`, { method: "DELETE" });
            showToast("Course deleted", "success");
            loadCourses();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <AuthGuard allowedRoles={["setter", "admin"]}>
            <div className="p-6 bg-blue-50 min-h-screen">

                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <i className="fa-solid fa-book"></i>
                        Course Manager
                    </h1>

                    <button
                        onClick={() => router.push("/set/create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Create Quiz
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center mt-20 text-gray-500">
                        <i className="fa-solid fa-folder-open text-4xl mb-3"></i>
                        <p>No courses yet</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course._id}
                                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
                            >
                                <h2 className="font-semibold text-lg text-gray-800 mb-2">
                                    {course.title}
                                </h2>

                                <div className="text-sm text-gray-600 space-y-1 mb-4">
                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-circle-info"></i>
                                        {course.is_public ? "Public" : "Private"}
                                    </p>

                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-list"></i>
                                        {course.questions?.length || 0} Questions
                                        {course.question_count
                                            ? ` (Limit ${course.question_count})`
                                            : ""}
                                    </p>

                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-clock"></i>
                                        {Math.floor((course.timer || 0) / 3600)}h{" "}
                                        {Math.floor(((course.timer || 0) % 3600) / 60)}m{" "}
                                        {(course.timer || 0) % 60}s
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">

                                    <button
                                        onClick={() =>
                                            router.push(`/set/${course._id}`)
                                        }
                                        className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                        Open
                                    </button>

                                    <button
                                        onClick={() =>
                                            router.push(`/set/${course._id}/results`)
                                        }
                                        className="flex-1 bg-indigo-500 text-white py-1.5 rounded-lg hover:bg-indigo-600 transition flex items-center justify-center gap-1"
                                    >
                                        <i className="fa-solid fa-chart-line"></i>
                                        Results
                                    </button>

                                    <button
                                        onClick={() => toggleAccess(course._id)}
                                        className="flex-1 bg-yellow-500 text-white py-1.5 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-1"
                                    >
                                        <i className="fa-solid fa-toggle-on"></i>
                                        Toggle
                                    </button>

                                    <button
                                        onClick={() => deleteCourse(course._id)}
                                        className="flex-1 bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                        Delete
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}