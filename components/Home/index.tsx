"use client";

import useXMTPConversation from "@/hooks/use-xmtp-conversation";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );

  const { conversations, createConversation, syncConversations, sendMessage } =
    useXMTPConversation();

  const startChat = async () => {
    try {
      const newConv = await createConversation([
        "0x1358155a15930f89eBc787a34Eb4ccfd9720bC62",
      ]);
      setCurrentConversation(newConv.id);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentConversation || !newMessage.trim()) return;

    try {
      await sendMessage(currentConversation, newMessage);
      setMessages([...messages, newMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">XMTP Chat</h1>

        {!currentConversation ? (
          <button
            onClick={startChat}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            Start Chat
          </button>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded shadow">
                  {msg}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
