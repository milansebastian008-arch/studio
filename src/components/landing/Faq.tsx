import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Who is this guide for?',
    answer: 'This guide is specifically designed for ambitious young Indians and professionals who are eager to build wealth, develop a strong mindset, and achieve financial independence. Whether you\'re a student, a recent graduate, or an early-career professional, you\'ll find immense value here.',
  },
  {
    question: 'Is this a physical book?',
    answer: 'No, "Success Pathway" is a digital product. After purchase, you will receive a link to download the complete guide as a PDF file, which you can read on any device.',
  },
  {
    question: 'What if I\'m not happy with my purchase?',
    answer: 'Given the extremely low price and the instant, irreversible nature of digital downloads, we do not offer refunds. We are confident that the value packed into this guide far exceeds its cost.',
  },
  {
    question: 'How do I pay?',
    answer: 'We support all major payment methods in India, including UPI, credit/debit cards, and net banking through a secure payment gateway. Your purchase is instant and secure.',
  },
    {
    question: 'Is this a get-rich-quick scheme?',
    answer: 'Absolutely not. This guide teaches sustainable, long-term strategies for wealth creation and personal growth. It requires commitment, discipline, and action. There are no shortcuts to true success.',
  },
];

export default function Faq() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We have answers.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full mt-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
