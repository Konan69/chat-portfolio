"use client";
import { Bot } from "lucide-react";
import { useState } from "react";
import AIChatBox from "./AIChatBox";
export default function AIChatButton() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <button onClick={() => setChatOpen(true)}>
        <Bot size={24} />
      </button>
      <AIChatBox open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
