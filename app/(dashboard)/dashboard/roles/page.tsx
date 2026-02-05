/**
 * Target Role Selection Page
 *
 * Allows users to select or change their target role.
 */

import { Metadata } from 'next';
import RoleSelectionContent from './RoleSelectionContent';

export const metadata: Metadata = {
  title: 'Select Target Role - RoleReady',
  description: 'Choose your target career role to track your readiness',
};

export default function RolesPage() {
  return <RoleSelectionContent />;
}
