/**
 * Skills Page
 * 
 * User skills management page.
 */

import { Metadata } from 'next';
import SkillsContent from './SkillsContent';

export const metadata: Metadata = {
  title: 'My Skills - RoleReady',
  description: 'Manage your skills and proficiency levels',
};

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
        <p className="text-gray-600 mt-1">
          Manage your skills, set proficiency levels, and request mentor validations
        </p>
      </div>
      <SkillsContent />
    </div>
  );
}