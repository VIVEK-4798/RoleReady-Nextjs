/**
 * Role-based Redirect Page
 * 
 * After OAuth sign-in, redirects users to the appropriate page based on their role.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RoleRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('REDIRECT: useEffect triggered');
    console.log('REDIRECT: Session status:', status);
    console.log('REDIRECT: Session data:', session);

    // Wait for session to fully load
    if (status === 'loading') {
      console.log('REDIRECT: Still loading...');
      return;
    }

    // If not authenticated, go back to login
    if (status === 'unauthenticated' || !session?.user) {
      console.warn('REDIRECT: No session found, redirecting to login');
      console.warn('REDIRECT: Session details:', { session, status });
      router.push('/login');
      return;
    }

    // Authenticated - redirect based on role
    console.log('REDIRECT: User authenticated');
    setRedirecting(true);
    
    const user = session.user as { role?: string; name?: string; email?: string };
    const role = user?.role || 'user';

    console.log('REDIRECT: User details:', { role, name: user?.name, email: user?.email });

    // Redirect based on role
    const redirectPath =
      role === 'admin'
        ? '/admin'
        : role === 'mentor'
        ? '/mentor'
        : '/dashboard';

    console.log('REDIRECT: Redirecting to:', redirectPath);
    router.push(redirectPath);
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block">
          <svg
            className="animate-spin h-8 w-8 text-[#5693C1]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="mt-4 text-gray-600">Redirecting you...</p>
      </div>
    </div>
  );
}
