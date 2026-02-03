/**
 * Admin Stats Cards Component
 * 
 * Displays key statistics cards for the admin dashboard.
 * Migrated from old project's DashboardCard.jsx
 */

import Link from 'next/link';
import { ReactNode } from 'react';

interface StatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  href: string;
  color: string;
  icon: ReactNode;
}

interface AdminStatsCardsProps {
  cards: StatCard[];
}

export default function AdminStatsCards({ cards }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Link
          key={index}
          href={card.href}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {card.title}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {card.value}
              </p>
              {card.subtitle && (
                <p className="mt-1 text-xs text-gray-500">
                  {card.subtitle}
                </p>
              )}
            </div>
            <div className={`${card.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
