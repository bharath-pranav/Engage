import { useState } from "react";
import Header from "@/components/Header";
import ChatArea from "@/components/ChatArea";
import { ChatService } from "@/lib/chatService";

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Hide welcome screen
    if (showWelcome) {
      setShowWelcome(false);
    }

    // Add user message
    addMessage(text, 'user');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get response from engage agent
      const response = await ChatService.askQuestion(text, currentSessionId);

      // Update session info
      setCurrentSessionId(response.sessionId);

      setIsTyping(false);
      addMessage(response.answer, 'bot');
    } catch (error) {
      console.error('Error getting bot response:', error);
      setIsTyping(false);
      addMessage(
        error instanceof Error
          ? error.message
          : "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        'bot'
      );
    }
  };


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="flex-1 flex flex-col">
        <Header />
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          showWelcome={showWelcome}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
