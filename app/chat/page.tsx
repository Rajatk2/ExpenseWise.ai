"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useUser, SignInButton } from "@clerk/nextjs";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function ChatPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await res.json();
      const aiMessage: Message = { role: "ai", content: data.result };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: "ai",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sign In to Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            You need to be logged in to use the AI chat feature. Please sign in to continue.
          </p>
          <SignInButton mode="modal">
            <button className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 hover:from-emerald-700 hover:via-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <span className="relative z-10">Sign In</span>
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  A
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                }`}
              >
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  Y
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="rounded-lg p-3 max-w-[75%] bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50">
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <p>Thinking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 md:p-6 bg-white dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <textarea
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
            rows={1}
            style={{ minHeight: "48px", maxHeight: "200px" }}
          />
          <button
            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </div>
    </main>
  );
}