"use client";

import { useEffect, useState, useCallback } from "react";
import AuthGuard from "../../components/AuthGuard";
import { fetchWithAuth } from "../../services/api";
import { useToast } from "../../components/ToastProvider";
import SearchBar from "../../components/SearchBar";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const { showToast } = useToast();
    const [search, setSearch] = useState("");

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "player",
    });

    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({ name: "", email: "" });

    const loadUsers = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const res = await fetchWithAuth("/users");
            setUsers(Array.isArray(res) ? res : []);
        } catch {
            showToast("Failed to load users", "error");
            setUsers([]);
        }
    }, [showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const token = localStorage.getItem("token");

            if (!token) return;

            loadUsers();
        }, 300);

        return () => clearTimeout(timer);
    }, [loadUsers]);

    const createUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            return showToast("All fields required", "error");
        }

        await fetchWithAuth("/users", {
            method: "POST",
            body: JSON.stringify(newUser),
        });

        showToast("User created", "success");

        setNewUser({ name: "", email: "", password: "", role: "player" });
        loadUsers();
    };

    const deleteUser = async (id) => {
        await fetchWithAuth(`/users/${id}`, {
            method: "DELETE",
        });

        showToast("User deleted", "success");

        setUsers((prev) => prev.filter((u) => u._id !== id));
    };

    const updateRole = async (id, role) => {
        await fetchWithAuth(`/users/${id}/role`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
        });

        showToast("Role updated", "success");

        setUsers((prev) =>
            prev.map((u) => (u._id === id ? { ...u, role } : u))
        );
    };

    const startEdit = (user) => {
        setEditingUser(user._id);
        setEditData({ name: user.name, email: user.email });
    };

    const saveEdit = async (id) => {
        await fetchWithAuth(`/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(editData),
        });

        showToast("User updated", "success");

        setUsers((prev) =>
            prev.map((u) =>
                u._id === id ? { ...u, ...editData } : u
            )
        );

        setEditingUser(null);
    };

    return (
        <AuthGuard allowedRoles={["admin"]}>
            <div className="p-6 bg-blue-50 min-h-screen">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search users..."
                />
                <h1 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                    <i className="fa-solid fa-users-cog"></i>
                    Admin Dashboard
                </h1>

                <div className="bg-white p-6 rounded-2xl shadow mb-6">
                    <h2 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-user-plus"></i>
                        Create User
                    </h2>

                    <div className="grid md:grid-cols-2 gap-3">
                        <input
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) =>
                                setNewUser({ ...newUser, name: e.target.value })
                            }
                            className="border p-2 rounded-lg"
                        />

                        <input
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) =>
                                setNewUser({ ...newUser, email: e.target.value })
                            }
                            className="border p-2 rounded-lg"
                        />

                        <input
                            placeholder="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) =>
                                setNewUser({ ...newUser, password: e.target.value })
                            }
                            className="border p-2 rounded-lg"
                        />

                        <select
                            value={newUser.role}
                            onChange={(e) =>
                                setNewUser({ ...newUser, role: e.target.value })
                            }
                            className="border p-2 rounded-lg"
                        >
                            <option value="player">Player</option>
                            <option value="setter">Setter</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        onClick={createUser}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Create User
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <i className="fa-solid fa-users text-4xl mb-3"></i>
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users
                                .filter((user) =>
                                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                                    user.email.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((user) => (
                            <div
                                key={user._id}
                                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
                            >
                                {editingUser === user._id ? (
                                    <>
                                        <input
                                            value={editData.name}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="border p-2 w-full mb-2 rounded"
                                        />

                                        <input
                                            value={editData.email}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="border p-2 w-full mb-2 rounded"
                                        />

                                        <button
                                            onClick={() => saveEdit(user._id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            Save
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="font-semibold text-lg text-gray-800">
                                            {user.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    </>
                                )}

                                <div className="mt-3">
                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            updateRole(user._id, e.target.value)
                                        }
                                        className="border p-1 rounded"
                                    >
                                        <option value="player">Player</option>
                                        <option value="setter">Setter</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => startEdit(user)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1"
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteUser(user._id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1"
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