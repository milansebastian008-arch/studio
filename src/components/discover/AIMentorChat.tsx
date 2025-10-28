'use client';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getMentorResponse } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, Send, Sparkles, User as UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const initialState = {
  messages: [],
  error: null,
  currentStage: 'GREETING',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Send />}
    </Button>
  );
}

export function AIMentorChat() {
  const { user } = useUser();
  const firestore = useFirestore();
  const formRef = useRef<HTMLFormElement>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [state, formAction] = useFormState(getMentorResponse, initialState);

  // Set initial greeting from AI
  useEffect(() => {
    if (userProfile && messages.length === 0 && state.messages.length === 0) {
        const greetingMessage = {
            id: 'initial-greeting',
            role: 'assistant' as const,
            text: `Hi ${userProfile.name}! I'm your AI Mentor. I'm here to help you turn your passions into income. Ready to start? Just say "yes"!`,
        };
        setMessages([greetingMessage]);
    }
  }, [userProfile]);
  
  // Handle new messages from the form action
  useEffect(() => {
    if (state.messages && state.messages.length > 0) {
      const newMessages: Message[] = state.messages.map((msg: string, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        role: 'assistant',
        text: msg,
      }));
      setMessages((prev) => [...prev, ...newMessages]);
    }
  }, [state.messages]);

  const handleFormSubmit = (formData: FormData) => {
    const userMessage = formData.get('userMessage') as string;
    if (userMessage.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', text: userMessage },
      ]);
      formAction(formData);
      setUserInput('');
      formRef.current?.reset();
    }
  };
  
  if (isProfileLoading || !userProfile) {
      return <div><Loader2 className="animate-spin" /> Loading your mentor...</div>
  }

  return (
    <Card className="shadow-lg">
        <CardHeader className="text-center">
            <div className="inline-flex bg-primary/10 p-3 rounded-lg mb-4 mx-auto w-fit">
                <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your Personal AI Mentor</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Your journey to turning skills into income starts now.
            </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
            <div className="space-y-4">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Sparkles /></AvatarFallback>
                    </Avatar>
                    )}
                    <div className={`rounded-lg p-3 max-w-[80%] ${
                        msg.role === 'assistant'
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><UserIcon /></AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          ref={formRef}
          action={handleFormSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input name="userMessage" placeholder="Type your message..." value={userInput} onChange={(e) => setUserInput(e.target.value)} autoComplete='off' />
          <input type="hidden" name="userId" value={user?.uid} />
          <input type="hidden" name="currentStage" value={state.currentStage} />
          <input type="hidden" name="userProfile" value={JSON.stringify(userProfile)} />
          <SubmitButton />
        </form>
      </CardFooter>
      {state.error && (
        <div className="p-6 pt-0">
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            An error occurred: {JSON.stringify(state.error)}
          </div>
        </div>
      )}
    </Card>
  );
}
