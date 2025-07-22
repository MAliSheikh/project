import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getChatHistory, sendChatMessage } from '../services/api';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id?: number;
  question: string;
  answer: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string | null;
  isUser: boolean;
}

interface ApiResponse {
  id: number;
  question: string;
  answer: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  fetchHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const { user, token } = useAuth();

  const fetchHistory = async () => {
    if (!token || historyFetched) return;
    
    try {
      setIsLoading(true);
      const history = await getChatHistory(token);
      
      const formattedHistory: ChatMessage[] = history.map((item) => ({
        ...item,
        isUser: false,
      }));
      
      setMessages(formattedHistory);
      setHistoryFetched(true);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      // Fallback to dummy data if API is down
      const dummyMessages: ChatMessage[] = [
        {
          id: 1,
          question: "What are the mid-term exam dates?",
          answer: "According to the academic calendar, the Mid Term Examination for Summer 2025 is scheduled to take place from Monday, August 04 to Sunday, August 10, 2025.",
          isUser: true,
        },
        {
          id: 1,
          question: "What are the mid-term exam dates?",
          answer: "According to the academic calendar, the Mid Term Examination for Summer 2025 is scheduled to take place from Monday, August 04 to Sunday, August 10, 2025.",
          isUser: false,
        }
      ];
      setMessages(dummyMessages);
      setHistoryFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      question: message,
      answer: '',
      isUser: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 60000)
      );
      
      const response = await Promise.race([
        sendChatMessage(message, token!),
        timeoutPromise
      ]);
      
      const botMessage: ChatMessage = {
        ...response,
        isUser: false,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.message === 'Request timeout') {
        const timeoutMessage: ChatMessage = {
          question: message,
          answer: "The response is taking longer than expected. Please wait while I process your request...",
          isUser: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, timeoutMessage]);
        
        try {
          const response = await sendChatMessage(message, token!);
          const botMessage: ChatMessage = {
            ...response,
            isUser: false,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => prev.map(msg => 
            msg.answer === timeoutMessage.answer ? botMessage : msg
          ));
        } catch (retryError) {
          console.error('Failed after retry:', retryError);
          const errorMessage: ChatMessage = {
            question: message,
            answer: "I'm sorry, I'm currently unable to process your request. Please try again later.",
            isUser: false,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => prev.map(msg => 
            msg.answer === timeoutMessage.answer ? errorMessage : msg
          ));
        }
      } else {
        const errorMessage: ChatMessage = {
          question: message,
          answer: "I'm sorry, I'm currently unable to process your request. Please try again later.",
          isUser: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (user && token && !historyFetched) {
      fetchHistory();
    }
  }, [user, token]);

  // Reset chat state on logout
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setHistoryFetched(false);
    }
  }, [user]);

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearChat, fetchHistory }}>
      {children}
    </ChatContext.Provider>
  );
};