"use client";

import { ArrowUp, Sparkles, Loader2, AudioLines } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
  loading?: boolean;
};

export default function Page() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: trimmedMessage,
      },
      // Add temporary loading bot message
      {
        sender: "bot",
        text: "",
        loading: true,
      },
    ]);

    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch("http://localhost:8000/ai-agent/chat", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Failed to get chat response.");
      }

      const botResponse =
        typeof data === "string"
          ? data
          : data.message ?? data.response ?? "No response returned.";

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.loading
            ? {
              sender: "bot",
              text: botResponse,
            }
            : msg
        )
      );
    } catch {
      // Replace loading with error
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.loading
            ? {
              sender: "bot",
              text: "Unable to reach the assistant right now.",
            }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col px-5 pt-6">
      {/* Header */}
      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 transform items-center gap-2 rounded-full border border-emerald-400 bg-emerald-50/60 px-3 py-1 text-sm text-emerald-500">
        <Sparkles size={18} />
        Powered by Maa-care AI agent
      </div>

      {/* Chat Messages */}
      <div className="scrollbar-none mb-2 mt-8 flex-1 overflow-y-auto rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${msg.sender === "user"
              ? "justify-end"
              : "justify-start"
              }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl border border-slate-300 bg-white px-4 py-2 ${msg.sender === "user"
                ? "rounded-br-none"
                : "rounded-bl-none"
                }`}
            >
              {msg.loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  <span className="text-sm text-slate-500">
                    Thinking...
                  </span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mx-auto mb-5 flex h-20 w-[40%] items-center rounded-2xl border-2 border-slate-300 bg-white p-2">
        <textarea
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={isSending}
          className="flex-1 resize-none rounded-lg p-2 focus:outline-none disabled:bg-white"
        />


        {/*  <button className="rounded-full bg-emerald-500 h-10 w-10 flex items-center justify-center text-white">
          <AudioLines />
        </button> */}
        <button
          onClick={handleSend}
          disabled={isSending}
          className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowUp />
        </button>


      </div>
    </div>
  );
}