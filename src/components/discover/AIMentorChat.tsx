
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { getMentorResponse, type MentorFlowOutput, type MentorFlowInput } from '@/ai/flows/mentor-flow';

// Define the initial state for the chat
const initialState: MentorFlowOutput = {
  nextStage: 'GREETING',
  mentorResponse: "Hello! I'm M, your AI mentor. What financial or personal growth goal is on your mind?",
  conversationHistory: [{
    role: 'model',
    content: "Hello! I'm M, your AI mentor. What financial or personal growth goal is on your mind?"
  }],
};

export default function AIMentorChat() {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // This ensures client-only logic runs after the component has mounted.
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [chatState, formAction, isFormPending] = useActionState<MentorFlowOutput, FormData>(
    async (previousState, formData) => {
      const userMessage = formData.get('userMessage') as string;
      if (!userMessage) return previousState;
      
      const input: MentorFlowInput = {
        currentStage: previousState.nextStage,
        userMessage: userMessage,
        userName: user?.displayName || 'User',
        conversationHistory: previousState.conversationHistory,
      };

      const newState = await getMentorResponse(input);
      formRef.current?.reset();
      return newState;
    },
    initialState
  );
  
  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatState.conversationHistory]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {chatState.conversationHistory.map((entry, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                entry.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {entry.role === 'model' && (
                <Avatar>
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-md ${
                  entry.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{entry.content}</p>
              </div>
              {entry.role === 'user' && isClient && ( // Only render user avatar on the client
                <Avatar>
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

           {isFormPending && (
             <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 max-w-xs">
                <p className='text-sm animate-pulse'>M is typing...</p>
              </div>
            </div>
           )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          ref={formRef}
          action={formAction}
          className="flex items-center gap-2"
        >
          <Input
            name="userMessage"
            placeholder="Type your message..."
            autoComplete="off"
            disabled={isFormPending || chatState.nextStage === 'CONCLUDED'}
          />
          <Button type="submit" size="icon" disabled={isFormPending || chatState.nextStage === 'CONCLUDED'}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
