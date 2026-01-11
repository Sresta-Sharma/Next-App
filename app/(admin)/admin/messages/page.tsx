"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ContactMessage = {
  message_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  country_code: string | null;
  phone: string | null;
  message: string;
  replied: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== "admin") {
        toast.error("Unauthorized access");
        router.push("/");
        return;
      }
    }

    fetchMessages();
  }, [router]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contact/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        toast.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error loading messages");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (messageId: number) => {
    setReplyingTo(messageId);
    setReplyMessage("");
  };

  const handleSendReply = async (messageId: number) => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contact/messages/${messageId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ replyMessage }),
        }
      );

      if (response.ok) {
        toast.success("Reply sent successfully!");
        setReplyingTo(null);
        setReplyMessage("");
        // Update the message as replied
        setMessages(messages.map(msg => 
          msg.message_id === messageId ? { ...msg, replied: true } : msg
        ));
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Error sending reply");
    } finally {
      setSending(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyMessage("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111]">Contact Messages</h1>
        <p className="text-gray-600 mt-2">
          Total messages: {messages.length} | Replied: {messages.filter(m => m.replied).length}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`bg-white rounded-lg border shadow-sm p-6 ${
                msg.replied ? "border-green-200" : "border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#111111]">
                    {msg.first_name} {msg.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(msg.created_at)}
                  </p>
                </div>
                {msg.replied && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Replied
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="mb-4 space-y-1">
                {msg.email && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Email:</span>{" "}
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {msg.email}
                    </a>
                  </p>
                )}
                {msg.phone && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Phone:</span> {msg.country_code}{msg.phone}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              {replyingTo === msg.message_id ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none min-h-[100px]"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSendReply(msg.message_id)}
                      disabled={sending}
                      className="px-6 py-2 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                    <button
                      onClick={handleCancelReply}
                      disabled={sending}
                      className="px-6 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  {msg.email ? (
                    <button
                      onClick={() => handleReply(msg.message_id)}
                      className="px-6 py-2 bg-[#111111] text-white rounded-full text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                    >
                      Reply via Email
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No email provided - cannot send reply
                    </p>
                  )}
                  {msg.email && (
                    <a
                      href={`mailto:${msg.email}`}
                      className="px-6 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-100 transition cursor-pointer"
                    >
                      Open Email Client
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
