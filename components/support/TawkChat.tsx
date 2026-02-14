'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks';

export default function TawkChat() {
    const { user } = useAuth();

    useEffect(() => {
        // Prevent loading twice
        if (document.getElementById('tawk-script')) return;

        const script = document.createElement('script');
        script.id = 'tawk-script';
        script.async = true;
        script.src = 'https://embed.tawk.to/69900be085e35c1c3911ec78/1jhdaspn2'; // replace
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (user) {
            const win = window as any;
            win.Tawk_API = win.Tawk_API || {};

            // Set visitor info directly
            win.Tawk_API.visitor = {
                name: user.name,
                email: user.email,
            };

            // If widget is already active, update attributes dynamically
            if (win.Tawk_API.setAttributes) {
                win.Tawk_API.setAttributes({
                    name: user.name,
                    email: user.email,
                }, function (error: any) { });
            }
        }
    }, [user]);

    return null;
}
