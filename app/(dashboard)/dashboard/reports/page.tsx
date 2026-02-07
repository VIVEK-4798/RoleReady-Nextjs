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
  return (
    <div className="space-y-6">
      <div className="print-hide">
        <h1 className="text-2xl font-bold text-gray-900">Readiness Report</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analysis of your skill readiness and learning roadmap
        </p>
      </div>
      <ReportClient />
    </div>
  );
}