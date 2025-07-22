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
      const history = await getChatHistory(token) as ApiResponse[];
      
      // Sort history by ID in ascending order
      const sortedHistory = [...history].sort((a, b) => a.id - b.id);
      
      // Create pairs of messages (question and answer)
      const formattedHistory: ChatMessage[] = [];
      sortedHistory.forEach((item) => {
        // Add user question
        formattedHistory.push({
          id: item.id,
          question: item.question,
          answer: "",
          user_id: item.user_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          isUser: true
        });
        
        // Add bot answer
        formattedHistory.push({
          id: item.id,
          question: item.question,
          answer: item.answer,
          user_id: item.user_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          isUser: false
        });
      });
      
      setMessages(formattedHistory);
      setHistoryFetched(true);
    } catch (error: unknown) {
      console.error('Failed to fetch chat history:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error(errorMessage);
      setMessages([]);
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