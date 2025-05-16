'use client';

import { use } from 'react'; // Keep use for dictionary
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Rocket, Zap, LayoutDashboard, Settings, Menu, Sun, Moon, ChartNoAxesCombined } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { useState, useEffect } from 'react'; // Keep useState/useEffect for other states if needed, but remove session state/effect
import { createClient } from '@/lib/supabase/client'; // Keep createClient if needed elsewhere, but session fetching moves to AuthNavLinks
import Link from 'next/link'; // Keep Link import for Dashboard link
import AuthNavLinks from '@/components/AuthNavLinks'; // Import the new component
// Reusable component for features
const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="p-6 rounded-xl bg-card border border-white/10 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    >
        <div className="mb-4 text-muted-foreground">{icon}</div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-foreground">{description}</p>
    </motion.div>
);

// Reusable component for testimonials
const TestimonialCard = ({ name, title, quote, image }: { name: string; title: string; quote: string; image: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="p-6 rounded-xl bg-muted backdrop-blur-lg border border-white/10 shadow-lg"
    >
        <div className="flex items-center gap-4 mb-4">
            <img src={image} alt={name} className="w-12 h-12 rounded-full" />
            <div>
                <h4 className="text-lg font-semibold text-muted-foreground">{name}</h4>
                <p className="text-card-foreground">{title}</p>
            </div>
        </div>
        <p className="text-card-foreground italic">"{quote}"</p>
    </motion.div>
);

const ThemeSwitcherButton = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

// Pricing Card Component
const PricingCard = ({ title, price, description, features, isPro }: { title: string; price: string; description: string; features: string[]; isPro?: boolean }) => (
    <Card
        className={cn(
            "flex flex-col justify-evenly transition-all duration-300",
            isPro
                ? "bg-muted border border-border shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]"
                : "bg-card border border-border shadow-md hover:shadow-lg hover:scale-[1.02]"
        )}
    >
        <CardHeader>
            <CardTitle className={cn(
                "text-2xl font-semibold",
                isPro ? "text-muted-foreground" : "text-card-foreground"
            )}>
                {title}
            </CardTitle>
            <CardDescription className={isPro ? "text-card-foreground" : "text-foreground"}>
                {price}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className={cn("text-card-foreground mb-4", isPro && "text-card-foreground mb-4")}>{description}</p>
            <ul className="space-y-2">
                {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-bg-foreground">
                        <CheckCircle className={cn("w-4 h-4", isPro ? "text-muted-foreground" : "text-popover-foreground")} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter>
            <Button
                className={cn(
                    "w-full mt-6",
                    isPro
                        ? "bg-accent text-accent-foreground hover:bg-card"
                        : "bg-muted text-muted-foreground hover:bg-card"
                )}
            >
                Get {isPro ? "Pro" : "Started"}
            </Button>
        </CardFooter>
    </Card>
);

// Main Landing Page Component
const SaaSProductLandingPage = ({ params }: { params: Promise<{ lang: Locale }> }) => {
    const { lang } = use(params);
    // Remove session state and effect, session handling is now in AuthNavLinks
    const [dictionary, setDictionary] = useState<any>(null);

    useEffect(() => {
        const fetchDictionary = async () => {
            const dict = await getDictionary(lang);
            setDictionary(dict);
        };
        fetchDictionary();
    }, [lang]); // Dependency array only needs lang


    if (!dictionary) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    const landingDict = dictionary.landing || {}; // Use a default empty object if landing key is missing

    return (
        <div className="bg-gradient-background min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="py-4 px-4 sm:px-6 lg:px-8 bg-gradient-muted backdrop-blur-md sticky top-0 z-50 border-b border-border">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    {/* Logo */}
                    <a href="#" className="text-2xl font-bold text-card-foreground">
                        {landingDict.appName || "SaaS Product"}
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-card-foreground hover:text-muted-foreground transition-colors">{landingDict.navFeatures || "Features"}</a>
                        <a href="#about-us" className="text-card-foreground hover:text-muted-foreground transition-colors">{landingDict.navAboutUs || "About Us"}</a>
                        <a href="#pricing" className="text-card-foreground hover:text-muted-foreground transition-colors">{landingDict.navPricing || "Pricing"}</a>
                        <a href="#feedback" className="text-card-foreground hover:text-muted-foreground transition-colors">{landingDict.navFeedback || "Feedback"}</a>
                           <AuthNavLinks
                                lang={lang}
                                loginText={landingDict.navLogin || "Login"}
                                signUpText={landingDict.navSignUp || "Sign Up"}
                                dashboardText="Dashboard" // Assuming Dashboard text is static or fetched elsewhere
                           />
                        <ThemeSwitcherButton /> {/* Add the theme switcher button here */}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <ThemeSwitcherButton /> {/* Add the theme switcher button here */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" className="text-text-primary hover:bg-element-bg/10">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-element-bg text-card-foreground w-full sm:max-w-sm">
                                <SheetHeader>
                                    <SheetTitle className="text-2xl font-bold text-text-primary">
                                        {landingDict.appName || "SaaS Product"}
                                    </SheetTitle>
                                    <SheetDescription>
                                        <div className="flex flex-col gap-4 mt-6">
                                            <a href="#features" className="text-card-foreground  hover:text-text-primary transition-colors text-lg">{landingDict.navFeatures || "Features"}</a>
                                            <a href="#about-us" className="text-card-foreground  hover:text-text-primary transition-colors text-lg">{landingDict.navAboutUs || "About Us"}</a>
                                            <a href="#pricing" className="text-card-foreground hover:text-text-primary transition-colors text-lg">{landingDict.navPricing || "Pricing"}</a>
                                            <a href="#feedback" className="text-card-foreground  hover:text-text-primary transition-colors text-lg">{landingDict.navFeedback || "Feedback"}</a>
                                            <AuthNavLinks // Replace conditional rendering with AuthNavLinks
                                                lang={lang}
                                                loginText={landingDict.navLogin || "Login"}
                                                signUpText={landingDict.navSignUp || "Sign Up"}
                                                dashboardText="Dashboard" // Assuming Dashboard text is static or fetched elsewhere
                                            />
                                        </div>
                                    </SheetDescription>
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="home" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-muted-foreground bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary mb-4"
                >
                    {landingDict.heroTitle || "Revolutionize Your Workflow"}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg sm:text-xl md:text-2xl text-card-foreground mb-8 max-w-3xl mx-auto"
                >
                    {landingDict.heroSubtitle || "The ultimate SaaS solution to streamline your projects, boost productivity, and achieve your goals faster."}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex justify-center"
                >
                    <Button
                        size="lg"
                        className="bg-muted text-muted-foreground px-8 py-3 rounded-full shadow-neumorphic-sm hover:shadow-neumorphic transition-all duration-300 flex items-center gap-2"
                    >
                        {landingDict.heroCta || "Get Started"} <ArrowRight className="w-5 h-5" />
                    </Button>
                </motion.div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-semibold text-card-foreground text-center mb-12">{landingDict.featuresTitle || "Key Features"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            title={landingDict.feature1Title || "Intuitive Interface"}
                            description={landingDict.feature1Description || "Clean and user-friendly design for seamless navigation and quick adoption."}
                            icon={<LayoutDashboard className="w-8 h-8 text-accent-primary" />}
                        />
                        <FeatureCard
                            title={landingDict.feature2Title || "Powerful Automation"}
                            description={landingDict.feature2Description || "Automate repetitive tasks and workflows to save time and reduce errors."}
                            icon={<Zap className="w-8 h-8 text-accent-primary" />}
                        />
                        <FeatureCard
                            title={landingDict.feature3Title || "Real-time Collaboration"}
                            description={landingDict.feature3Description || "Enable your team to work together efficiently, no matter where they are."}
                            icon={<Rocket className="w-8 h-8 text-accent-primary" />}
                        />
                        <FeatureCard
                            title={landingDict.feature4Title || "Customizable Workflows"}
                            description={landingDict.feature4Description || "Tailor the platform to fit your unique business needs and processes."}
                            icon={<Settings className="w-8 h-8 text-accent-primary" />}
                        />
                        <FeatureCard
                            title={landingDict.feature5Title || "Advanced Analytics"}
                            description={landingDict.feature5Description || "Gain valuable insights with comprehensive reporting and data visualization."}
                            icon={<CheckCircle className="w-8 h-8 text-accent-primary" />}
                        />
                        <FeatureCard
                            title={landingDict.feature6Title || "24/7 Support"}
                            description={landingDict.feature6Description || "Our dedicated support team is always here to help you with any issues."}
                            icon={<ChartNoAxesCombined className="w-8 h-8 text-accent-primary" />}
                        />
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about-us" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-semibold text-card-primary text-center mb-12">{landingDict.aboutUsTitle || "About Us"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-semibold text-muted-foreground mb-4">{landingDict.aboutUsMissionTitle || "Our Mission"}</h3>
                            <p className="text-card-foreground">
                                {landingDict.aboutUsMissionDescription || "At [Your Company Name], our mission is to empower businesses of all sizes with cutting-edge SaaS solutions that drive efficiency, productivity, and growth. We believe that technology should simplify complex processes and enable teams to achieve their goals faster and more effectively."}
                            </p>
                            <h3 className="text-2xl font-semibold text-muted-foreground mt-8 mb-4">{landingDict.aboutUsTeamTitle || "Our Team"}</h3>
                            <p className="text-card-foreground">
                                {landingDict.aboutUsTeamDescription || "We are a passionate team of innovators, engineers, and problem-solvers dedicated to creating exceptional software that makes a real difference. With years of experience in the industry, we understand the challenges businesses face, and we're committed to providing solutions that are both powerful and user-friendly."}
                            </p>
                        </div>
                        <div>
                            <img
                                src="/aboutus3.jpg"
                                alt={landingDict.aboutUsImageAlt || "About Us"}
                                className="rounded-xl shadow-neumorphic-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-semibold text-text-primary text-center mb-12">{landingDict.pricingTitle || "Pricing Plans"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <PricingCard
                            title={landingDict.pricingBasicTitle || "Basic"}
                            price={landingDict.pricingBasicPrice || "$9/month"}
                            description={landingDict.pricingBasicDescription || "For small teams and startups."}
                            features={[
                                landingDict.pricingBasicFeature1 || "10 Users",
                                landingDict.pricingBasicFeature2 || "100 GB Storage",
                                landingDict.pricingBasicFeature3 || "Basic Features",
                                landingDict.pricingBasicFeature4 || "Email Support",
                            ]}
                        />
                        <PricingCard
                            title={landingDict.pricingProTitle || "Pro"}
                            price={landingDict.pricingProPrice || "$49/month"}
                            description={landingDict.pricingProDescription || "For growing businesses."}
                            features={[
                                landingDict.pricingProFeature1 || "50 Users",
                                landingDict.pricingProFeature2 || "500 GB Storage",
                                landingDict.pricingProFeature3 || "Advanced Features",
                                landingDict.pricingProFeature4 || "Priority Email Support",
                                landingDict.pricingProFeature5 || "Integrations",
                            ]}
                            isPro={true}
                        />
                        <PricingCard
                            title={landingDict.pricingEnterpriseTitle || "Enterprise"}
                            price={landingDict.pricingEnterprisePrice || "Contact Us"}
                            description={landingDict.pricingEnterpriseDescription || "For large organizations."}
                            features={[
                                landingDict.pricingEnterpriseFeature1 || "Unlimited Users",
                                landingDict.pricingEnterpriseFeature2 || "Unlimited Storage",
                                landingDict.pricingEnterpriseFeature3 || "All Features",
                                landingDict.pricingEnterpriseFeature4 || "24/7 Support",
                                landingDict.pricingEnterpriseFeature5 || "Customization",
                                landingDict.pricingEnterpriseFeature6 || "Dedicated Account Manager",
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Feedback Section */}
            <section id="feedback" className="py-16 px-4 sm:px-6 lg:px-8 bg-element-bg">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-semibold text-text-primary text-center mb-12">{landingDict.feedbackTitle || "What Our Users Say"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TestimonialCard
                            name={landingDict.testimonial1Name || "John Smith"}
                            title={landingDict.testimonial1Title || "CEO, Tech Innovators Inc."}
                            quote={landingDict.testimonial1Quote || "This SaaS product has completely transformed our workflow. The automation features alone have saved us countless hours."}
                            image="https://img.freepik.com/free-photo/portrait-employee-happy-be-back-work_23-2148727615.jpg?t=st=1747025850~exp=1747029450~hmac=63ef34d5cc2cd780b014f594ddd36a0b9799d997a5de8c31223d1c256be97412&w=826"
                        />
                        <TestimonialCard
                            name={landingDict.testimonial2Name || "Jane Doe"}
                            title={landingDict.testimonial2Title || "Project Manager, Global Corp"}
                            quote={landingDict.testimonial2Quote || "The collaboration tools are fantastic. Our team is more connected and productive than ever before."}
                            image="https://img.freepik.com/free-photo/beautiful-woman-dreaming-cyber-monday-sales_23-2148313194.jpg?t=st=1747025935~exp=1747029535~hmac=e6e436dd2fdcf4884cb8455171329119897ae8ec454a4b7b6b443b139f12916b&w=826"
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-3xl mx-auto justify-items-center">
                    <h2 className="text-3xl font-semibold text-text-primary mb-8">{landingDict.ctaTitle || "Ready to Get Started?"}</h2>
                    <Button
                        size="lg"
                        className="bg-accent text-primary-foreground px-8 py-3 rounded-full shadow-neumorphic-sm hover:shadow-neumorphic transition-all duration-300 flex items-center gap-2"
                    >
                        {landingDict.ctaButton || "Start Your Free Trial"} <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center text-text-secondary">
                <p>&copy; {new Date().getFullYear()} {landingDict.footerText || "My SaaS Product. All rights reserved."}</p>
            </footer>
        </div>
    );
};

export default SaaSProductLandingPage;
