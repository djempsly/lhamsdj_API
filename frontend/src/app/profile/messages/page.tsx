"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Conversation = {
  userId: number;
  name: string;
  profileImage?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
};

export default function UserMessagesPage() {
  const t = useTranslations("profile");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setConversations(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const loadMessages = async (userId: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/messages/thread/${userId}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setMessages(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoadingMessages(false);
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser.userId);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedUser || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId: selectedUser.userId, content: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        loadMessages(selectedUser.userId);
        loadConversations();
      }
    } catch { /* empty */ }
    setSending(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile" className="text-gray-500 hover:text-black">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden flex" style={{ height: "70vh" }}>
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-gray-400 text-sm">Loading...</p>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageCircle className="mx-auto mb-2" size={32} />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedUser(conv)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedUser?.userId === conv.userId ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {conv.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium text-sm truncate">{conv.name}</p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <p className="font-medium">{selectedUser.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <p className="text-center text-gray-400 text-sm py-4">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId !== selectedUser.userId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          isMine ? "bg-black text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-gray-400" : "text-gray-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
