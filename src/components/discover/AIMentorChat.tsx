'use client';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getMentorResponse } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [state, formAction] = useFormState(getMentorResponse, initialState);

  // This effect runs once when the component loads to initiate the conversation
  useEffect(() => {
    // Only trigger if we have a user profile and no messages have been sent yet
    if (userProfile && user && messages.length === 0 && state.messages.length === 0) {
        const initialFormData = new FormData();
        initialFormData.append('userId', user.uid);
        initialFormData.append('currentStage', 'GREETING');
        initialFormData.append('userMessage', 'Hi, I just signed up and I am ready to start!');
        initialFormData-append('userProfile', JSON.stringify(userProfile));
        formAction(initialFormData);
    }
  }, [user, userProfile, messages.length, state.messages.length, formAction]);

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
  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
      if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div');
          if(viewport) {
              viewport.scrollTop = viewport.scrollHeight;
          }
      }
  }, [messages]);

  const handleFormSubmit = (formData: FormData) => {
    const userMessage = formData.get('userMessage') as string;
    if (userMessage.trim() && userProfile) {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', text: userMessage },
      ]);
      // Append the latest user profile to the form data
      formData.set('userProfile', JSON.stringify(userProfile));
      formAction(formData);
      setUserInput('');
      formRef.current?.reset();
    }
  };
  
  if (isProfileLoading || !userProfile) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /> <span className='ml-4'>Loading your mentor...</span></div>
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
        <ScrollArea className="h-[400px] w-full pr-4" ref={scrollAreaRef}>
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
                 {useFormStatus().pending && messages.length > 0 && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Sparkles /></AvatarFallback>
                        </Avatar>
                         <div className="rounded-lg p-3 max-w-[80%] bg-muted text-foreground">
                            <Loader2 className='animate-spin h-5 w-5' />
                         </div>
                    </div>
                 )}
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
