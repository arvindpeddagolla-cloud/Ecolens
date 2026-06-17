import React, { useState, useRef, useEffect } from 'react';
import { mockAuth, mockGeminiAI } from '../services/mockServices';
import type { EmissionsLog } from '../services/mockServices';
import { sanitizeText } from '../utils/validation';
import { AICoachHeader } from './AICoachHeader';
import { AICoachChatFeed } from './AICoachChatFeed';
import type { Message } from './AICoachChatFeed';

interface AICoachTabProps {
  logs: EmissionsLog[];
}

const getMessageId = (sender: 'user' | 'coach') => {
  return `msg_${sender}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const getFormattedTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const AICoachTab: React.FC<AICoachTabProps> = ({ logs }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_init',
      sender: 'coach',
      text: "Hello! I'm your EcoLens AI Sustainability Coach. 🌍\n\nI can analyze your emissions logs, suggest low-carbon lifestyle changes, offer energy-saving advice, or suggest green shopping guides. What would you like to work on today?",
      timestamp: getFormattedTime()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    const sanitizedText = sanitizeText(textToSend);
    if (!sanitizedText) return;

    const userMsg: Message = {
      id: getMessageId('user'),
      sender: 'user',
      text: sanitizedText,
      timestamp: getFormattedTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const coachReplyText = await mockGeminiAI.chatCoachResponse(sanitizedText, logs);

      const coachMsg: Message = {
        id: getMessageId('coach'),
        sender: 'coach',
        text: coachReplyText,
        timestamp: getFormattedTime()
      };

      setMessages(prev => [...prev, coachMsg]);
      setIsTyping(false);

      const currentUser = mockAuth.getCurrentUser();
      mockAuth.updateUserProfile({ xp: currentUser.xp + 10 });
    } catch (err) {
      console.error('Coach API call failed:', err);
      setIsTyping(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col h-[560px]">
      <AICoachHeader />

      <AICoachChatFeed
        messages={messages}
        isTyping={isTyping}
        inputVal={inputVal}
        setInputVal={setInputVal}
        handleSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};
export default AICoachTab;
