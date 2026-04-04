'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks';

export default function TawkChat() {
    const { user } = useAuth();
    const [loadChat, setLoadChat] = useState(false);

    const triggerLoad = useCallback(() => {
        setLoadChat(true);
    }, []);

    useEffect(() => {
        // Delay timer (8 seconds)
        const timer = setTimeout(triggerLoad, 8000);

        // Interaction triggers
        const handleInteraction = () => {
            triggerLoad();
            removeListeners();
        };

        const removeListeners = () => {
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            clearTimeout(timer);
        };

        window.addEventListener('scroll', handleInteraction, { passive: true });
        window.addEventListener('click', handleInteraction, { passive: true });

        return () => {
            removeListeners();
        };
    }, [triggerLoad]);

    useEffect(() => {
        if (!loadChat) return;

        // Prevent loading twice
        if (document.getElementById('tawk-script')) return;

        const script = document.createElement('script');
        script.id = 'tawk-script';
        script.async = true;
        script.src = 'https://embed.tawk.to/69900be085e35c1c3911ec78/1jhdaspn2';
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        document.body.appendChild(script);
    }, [loadChat]);

    useEffect(() => {
        if (user && loadChat) {
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
    }, [user, loadChat]);

    return null;
}
