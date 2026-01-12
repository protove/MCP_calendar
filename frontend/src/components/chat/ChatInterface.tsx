"use client";

import { useState } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
    onClose: () => void;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: "Hello! I can help you manage your schedule and ledger. Try saying 'Add a meeting tomorrow at 2pm' or 'Record 5000 won for coffee'." }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        // Mock response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: `I understood: "${input}". (This is a mock response)` }
            ]);
        }, 1000);
    };

    return (
        <div className="flex h-full flex-col bg-white border-l border-gray-200 shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3 bg-custom-slate text-white">
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <button onClick={onClose} className="text-gray-200 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                            msg.role === "user"
                                ? "ml-auto bg-custom-slate text-white"
                                : "bg-white text-gray-900 shadow-sm border border-gray-100"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {msg.role === "assistant" && <Bot className="h-4 w-4 text-custom-green" />}
                            {msg.role === "user" && <User className="h-4 w-4 text-gray-200" />}
                            <span>{msg.content}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-custom-dark focus:border-custom-slate focus:outline-none"
                    />
                    <Button size="icon" onClick={handleSend} className="bg-custom-slate hover:bg-custom-dark">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
