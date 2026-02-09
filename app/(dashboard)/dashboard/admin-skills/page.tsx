'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks';

export default function AdminSkillsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/skills/admin');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedSkills = async () => {
    setIsSeeding(true);
    setMessage('');
    try {
      const res = await fetch('/api/skills/admin', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.data.message}`);
        await loadStats(); // Reload stats
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Failed to seed skills: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Database Admin</h1>
          <p className="text-gray-600 mb-6">Manage skills for resume parsing</p>

          {/* Stats Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Database Statistics</h2>
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {isLoading ? 'Loading...' : 'Load Statistics'}
            </button>

            {stats && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-lg font-bold text-blue-900">
                    Total Skills: {stats.totalSkills}
                  </p>
                  <p className="text-sm text-blue-700">{stats.message}</p>
                </div>

                {stats.byDomain && stats.byDomain.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Skills by Domain:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {stats.byDomain.map((item: any) => (
                        <div key={item._id} className="flex justify-between">
                          <span className="text-gray-700">{item._id}:</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.sampleSkills && stats.sampleSkills.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Sample Skills (first 20):</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.sampleSkills.map((skill: any) => (
                        <span
                          key={skill._id}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seed Section */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Seed Common Skills</h2>
            <p className="text-gray-600 mb-4">
              This will add 100+ common tech skills to the database including React, Node.js, MongoDB, SQL, etc.
            </p>
            
            <button
              onClick={seedSkills}
              disabled={isSeeding}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {isSeeding ? 'Seeding Skills...' : '🌱 Seed Skills Database'}
            </button>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.startsWith('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={message.startsWith('✅') ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">📋 How to Use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Click "Load Statistics" to check current skills in database</li>
              <li>If total skills is 0 or low, click "Seed Skills Database"</li>
              <li>Wait for confirmation message</li>
              <li>Go to your profile and upload your resume</li>
              <li>Click "Extract Skills from Resume" to see the magic! ✨</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
