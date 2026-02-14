import { auth } from "@/lib/auth";
import LandingHeader from "@/components/home/LandingHeader";
import PublicFooter from "@/components/layout/PublicFooter";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const isAuthenticated = !!session?.user;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LandingHeader isAuthenticated={isAuthenticated} />
            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    {children}
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
