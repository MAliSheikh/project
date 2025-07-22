import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getChatHistory, sendChatMessage } from '../services/api';
import { useAuth } from './AuthContext';

interface BaseChatMessage {
  question: string;
  answer: string;
}

interface ApiResponse extends BaseChatMessage {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

interface ChatMessage extends Partial<ApiResponse> {
  question: string;
  answer: string;
  isUser: boolean;
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

interface ChatResponse {
  id?: number;
  question: string;
  answer: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string | null;
}

export const ChatProvider = ({ children }: ChatProviderProps): JSX.Element => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const { user, token } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!token || historyFetched) return;
    
    try {
      setIsLoading(true);
      const history = await getChatHistory(token) as ApiResponse[];
      
      // Sort history by ID in ascending order (newest first)
      // and create pairs of messages (user question and bot answer)
      const formattedHistory: ChatMessage[] = history
        .sort((a, b) => a.id - b.id)
        .flatMap((item): [ChatMessage, ChatMessage] => [
          {
            id: item.id,
            question: item.question,
            answer: item.question, // Show question on the left side
            user_id: item.user_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            isUser: true
          },
          {
            id: item.id,
            question: item.question,
            answer: item.answer, // Show answer on the left side
            user_id: item.user_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            isUser: false
          }
        ]);
      
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
  }, [token, historyFetched]);

  const sendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = {
      question: message,
      answer: message, // Show question in the answer field for user messages
      isUser: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 60000)
      );
      
      const response = await Promise.race([
        sendChatMessage(message, token!),
        timeoutPromise
      ]) as unknown as ChatResponse;
      
      const botMessage: ChatMessage = {
        id: response.id,
        question: message,
        answer: response.answer,
        user_id: response.user_id,
        created_at: response.created_at || new Date().toISOString(),
        updated_at: response.updated_at,
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      if (error instanceof Error && error.message === 'Request timeout') {
        const timeoutMessage: ChatMessage = {
          question: message,
          answer: "The response is taking longer than expected. Please wait while I process your request...",
          isUser: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, timeoutMessage]);
        
        try {
          const response = await sendChatMessage(message, token!) as unknown as ChatResponse;
          const botMessage: ChatMessage = {
            id: response.id,
            question: message,
            answer: response.answer,
            user_id: response.user_id,
            created_at: response.created_at || new Date().toISOString(),
            updated_at: response.updated_at,
            isUser: false,
          };
          setMessages((prevMessages) => prevMessages.map((msg: ChatMessage) => 
            msg.answer === timeoutMessage.answer ? botMessage : msg
          ));
        } catch (retryError: unknown) {
          console.error('Failed after retry:', retryError);
          const errorMessage: ChatMessage = {
            question: message,
            answer: "I'm sorry, I'm currently unable to process your request. Please try again later.",
            isUser: false,
            created_at: new Date().toISOString(),
          };
          setMessages((prevMessages) => prevMessages.map((msg: ChatMessage) => 
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
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (user && token && !historyFetched) {
      fetchHistory();
    }
  }, [user, token, historyFetched, fetchHistory]);

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