/**
 * Dashboard Overview Page
 * 
 * Main dashboard view showing user's progress and quick stats.
 */

import { Metadata } from 'next';
import DashboardContent from './DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - RoleReady',
  description: 'Your job readiness dashboard',
};

export default function DashboardPage() {
  return <DashboardContent />;
}