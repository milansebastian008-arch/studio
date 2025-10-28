
'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { getMentorResponse, type MentorFlowOutput, type MentorFlowInput, type ConversationStage } from '@/ai/flows/mentor-flow';
import { Skeleton } from '../ui/skeleton';

// Define the initial state for the chat
const initialState: MentorFlowOutput = {
  nextStage: 'GREETING',
  mentorResponse: '',
  conversationHistory: [],
};

export default function AIMentorChat() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [chatState, formAction, isFormPending] = useActionState<MentorFlowOutput, FormData>(
    async (previousState, formData) => {
      const userMessage = formData.get('userMessage') as string;
      
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

  // Effect to initiate the conversation on component load
  useEffect(() => {
    // Only run if the conversation hasn't started
    if (chatState.conversationHistory.length === 0) {
      startTransition(async () => {
        const initialInput: MentorFlowInput = {
          currentStage: 'GREETING',
          userName: user?.displayName || 'User',
        };
        // This is a direct call on the server, not a form action
        const initialState = await getMentorResponse(initialInput);
        // We need to manually update our action state's result.
        // This is a bit of a workaround because useActionState doesn't have a simple "reset" or "set" function.
        // We'll create a fake form data object and dispatch.
        const fakeFormData = new FormData();
        fakeFormData.append('__manual_update', JSON.stringify(initialState));
        formAction(fakeFormData);
      });
    }
    // We only want this to run once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatState.conversationHistory]);

  // If we receive a manual update, we bypass the server action logic
  const handleManualUpdate = (formData: FormData): MentorFlowOutput | null => {
    const manualUpdate = formData.get('__manual_update');
    if (manualUpdate) {
      try {
        return JSON.parse(manualUpdate as string);
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  // Re-define the action to handle our manual update
  const wrappedFormAction = async (formData: FormData) => {
    const manualState = handleManualUpdate(formData);
    if (manualState) {
        // This is a bit of a hack, but we're just updating the state without a server call
        const fakePromise = Promise.resolve(manualState);
        (fakePromise as any).status = 'success';
        (fakePromise as any).data = manualState;
        (fakePromise as any).error = undefined;
        // The `useActionState` expects the action to return the new state.
        return manualState;
    } else {
        return getMentorResponse({
             currentStage: chatState.nextStage,
             userMessage: formData.get('userMessage') as string,
             userName: user?.displayName || 'User',
             conversationHistory: chatState.conversationHistory,
        });
    }
  };
  
  const [finalChatState, finalFormAction, finalIsFormPending] = useActionState(wrappedFormAction, initialState);


  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {(isPending && finalChatState.conversationHistory.length === 0) ? (
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 max-w-xs">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ) : (
            finalChatState.conversationHistory.map((entry, index) => (
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
                {entry.role === 'user' && (
                  <Avatar>
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>
                      {user?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
           {finalIsFormPending && (
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
          action={finalFormAction}
          className="flex items-center gap-2"
        >
          <Input
            name="userMessage"
            placeholder="Type your message..."
            autoComplete="off"
            disabled={finalIsFormPending || isPending || finalChatState.nextStage === 'CONCLUDED'}
          />
          <Button type="submit" size="icon" disabled={finalIsFormPending || isPending || finalChatState.nextStage === 'CONCLUDED'}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
