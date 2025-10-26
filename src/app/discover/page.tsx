import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { StrategyForm } from "@/components/discover/StrategyForm";
import { Sparkles } from "lucide-react";

export default function DiscoverPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section className="py-20 md:py-32">
                    <div className="container max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex bg-primary/10 p-3 rounded-lg mb-4">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your Personal AI Wealth Strategist</h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Get AI-generated strategies tailored to your unique financial situation and goals. Our tool analyzes your input against current market trends to provide actionable steps for wealth creation.
                            </p>
                        </div>
                        <div className="mt-16">
                           <StrategyForm />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
