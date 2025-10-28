'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface ChatEntry {
  role: 'user' | 'model';
  content: string;
}

async function fetchMentorResponse(history: ChatEntry[], userMessage: string, userName: string) {
  try {
    const res = await fetch('/api/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, userMessage, userName }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Server error response:", errorBody);
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.reply;
  } catch (error) {
    console.error("fetchMentorResponse error:", error);
    // Re-throw the error to be caught by the handleSubmit function's catch block
    throw error;
  }
}

export default function AIMentorChat() {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [history, setHistory] = useState<ChatEntry[]>([
    {
      role: 'model',
      content: "Hello! I'm M, your AI mentor. What financial or personal growth goal is on your mind?",
    },
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userMessage = formData.get('userMessage') as string;

    if (!userMessage.trim()) {
      return;
    }

    const newHistory: ChatEntry[] = [...history, { role: 'user', content: userMessage }];
    setHistory(newHistory);
    setIsPending(true);
    formRef.current?.reset();

    try {
      const reply = await fetchMentorResponse(newHistory, userMessage, user?.displayName || 'User');
      setHistory((prevHistory) => [...prevHistory, { role: 'model', content: reply }]);
    } catch (error) {
      console.error("Failed to get mentor response:", error);
      setHistory((prevHistory) => [...prevHistory, { role: 'model', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {history.map((entry, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}
            >
              {entry.role === 'model' && (
                <Avatar>
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-md ${
                  entry.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              </div>
              {entry.role === 'user' && isClient && (
                <Avatar>
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 max-w-xs">
                <p className="text-sm animate-pulse">M is typing...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input name="userMessage" placeholder="Type your message..." autoComplete="off" disabled={isPending} />
          <Button type="submit" size="icon" disabled={isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
