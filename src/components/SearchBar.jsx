"use client";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
    return (
        <div className="mb-6">
            <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                <i className="fa-solid fa-magnifying-glass text-gray-400 mr-2"></i>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full outline-none text-sm"
                />
            </div>
        </div>
    );
}