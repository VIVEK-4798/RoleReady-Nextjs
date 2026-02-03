/**
 * Admin Quick Actions Component
 * 
 * Common admin actions displayed as action cards.
 * Migrated from old project dashboard layout.
 */

import Link from 'next/link';
import { ReactNode } from 'react';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  color: string;
}

interface AdminQuickActionsProps {
  actions: QuickAction[];
}

export default function AdminQuickActions({ actions }: AdminQuickActionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className={`p-2 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900">{action.title}</p>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
