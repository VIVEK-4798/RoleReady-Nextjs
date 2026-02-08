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
      
      <SkillsContent />
    </div>
  );
}