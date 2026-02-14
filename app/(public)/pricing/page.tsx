import { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
    title: 'Pricing Plans | RoleReady',
    description: 'Explore affordable pricing plans tailored for students and professionals. Choose between Free, Pro, and Premium tiers to accelerate your career readiness.',
};

export default function PricingPage() {
    return <PricingClient />;
}
