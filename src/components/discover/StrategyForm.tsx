'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getWealthStrategies } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  userInfo: z.string().min(50, "Please provide at least 50 characters about your financial situation and goals."),
  riskAppetite: z.enum(["low", "medium", "high"], {
    required_error: "You need to select a risk appetite.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate My Strategy
    </Button>
  );
}

export function StrategyForm() {
  const [state, formAction] = useFormState(getWealthStrategies, initialState);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userInfo: '',
      riskAppetite: undefined,
    }
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Tell Us About Yourself</CardTitle>
        <CardDescription>
          The more details you provide, the better our AI can tailor your wealth strategy.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="userInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Financial Profile</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      name="userInfo"
                      placeholder="Describe your current income, savings, investments, financial goals (e.g., buying a house, early retirement), and any debts you have."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="riskAppetite"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Investment Risk Appetite</FormLabel>
                   <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      name="riskAppetite"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="low" />
                        </FormControl>
                        <FormLabel className="font-normal">Low (Prioritize safety of principal over high returns)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="font-normal">Medium (Willing to take moderate risks for moderate returns)</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="font-normal">High (Comfortable with high risks for potentially high returns)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Form>

      {state.error && (
        <div className="p-6 pt-0">
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                An error occurred: {typeof state.error === 'string' ? state.error : JSON.stringify(state.error)}
            </div>
        </div>
      )}

      {state.data && (
        <div className="p-6 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Your Personalized Wealth Strategy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                    {state.data}
                </CardContent>
            </Card>
        </div>
      )}
    </Card>
  );
}
