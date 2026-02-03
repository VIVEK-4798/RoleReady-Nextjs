/**
 * Admin Data Table Component
 * 
 * Reusable table component for admin data display.
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface AdminDataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  viewAllHref?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function AdminDataTable<T extends { id?: string; _id?: string }>({ 
  title, 
  columns, 
  data, 
  viewAllHref,
  emptyMessage = 'No data available',
  isLoading = false,
}: AdminDataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        {viewAllHref && (
          <Link 
            href={viewAllHref} 
            className="text-sm text-[#5693C1] hover:underline font-medium"
          >
            View All
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, idx) => (
                <tr 
                  key={item.id || item._id || idx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {col.render 
                        ? col.render(item) 
                        : (item as Record<string, unknown>)[col.key] as ReactNode
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
