"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ManageSubscriptions() {
    type Subscriber = {
        subscriber_id: number;
        email: string;
        is_active: boolean | string;
        subscribed_at: string;
    };
    
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.replace("/login");
            return;
        }

        const fetchSubscribers = async () => {
            try {
                console.log("Fetching from:", `${API}/api/subscribe/all`);
                const res = await fetch(`${API}/api/subscribe/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Response status:", res.status);

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log("Subscribers data:", data);
                setSubscribers(data.subscribers || []);
            } catch (err) {
                console.error("Error fetching subscribers:", err);
                toast.error(err instanceof Error ? err.message : "Failed to load subscribers");
            }
        };

        fetchSubscribers();
    }, [API, router]);

    const handleRemoveSubscriber = async (id: number) => {
        if (!confirm("Are you sure you want to remove this subscriber?")) return;

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast.error("Session expired. Please log in again.");
                router.replace("/login");
                return;
            }

            const res = await fetch(`${API}/api/subscribe/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to remove subscriber");
                return;
            }

            toast.success("Subscriber removed successfully");
            setSubscribers(subscribers.filter((sub) => sub.subscriber_id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Error removing subscriber");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#111111]">Manage Subscriptions</h1>
                    <p className="text-gray-500 mt-2">View and manage all newsletter subscribers.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700 text-sm border-b">
                                    <th className="p-4 text-left font-semibold">ID</th>
                                    <th className="p-4 text-left font-semibold">Email</th>
                                    <th className="p-4 text-left font-semibold">Status</th>
                                    <th className="p-4 text-left font-semibold">Type</th>
                                    <th className="p-4 text-left font-semibold">Subscribed Date</th>
                                    <th className="p-4 text-left font-semibold">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-500">
                                            No subscribers found
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((subscriber, idx) => (
                                        <tr key={subscriber.subscriber_id} className={`text-sm ${idx !== subscribers.length - 1 ? 'border-b' : ''}`}>
                                            <td className="p-4 text-gray-600">{subscriber.subscriber_id}</td>
                                            <td className="p-4 text-gray-900">{subscriber.email}</td>
                                            <td className="p-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    subscriber.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {subscriber.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    Unpaid
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {new Date(subscriber.subscribed_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                <button
                                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition text-xs font-semibold cursor-pointer"
                                                    onClick={() => handleRemoveSubscriber(subscriber.subscriber_id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
