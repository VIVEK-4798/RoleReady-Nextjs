/**
 * Readiness Report Page
 * 
 * Displays a comprehensive readiness report that can be:
 * - Viewed in the browser
 * - Exported as PDF (using browser print)
 * 
 * The report is READ-ONLY and uses existing snapshot data.
 */

import ReportClient from './ReportClient';

export const metadata = {
  title: 'Readiness Report | RoleReady',
  description: 'View and export your readiness report',
};

export default function ReportPage() {
  return <ReportClient />;
}
