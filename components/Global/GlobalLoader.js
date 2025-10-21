"use client"

import { useLoading } from "@/Hooks/LoadingContext"

export default function GlobalLoader() {
    const {isLoading,message} = useLoading();

    if (!isLoading) return null;

    return(
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
                {message && <p className="text-gray-700 mt-2">{message}</p>}
            </div>
        </div>
    );
}