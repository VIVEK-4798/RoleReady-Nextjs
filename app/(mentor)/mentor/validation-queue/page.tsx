/**
 * Skill Validation Queue Page
 * 
 * Review and validate user skills as a mentor.
 */

import { Metadata } from 'next';
import ValidationQueueClient from './ValidationQueueClient';

export const metadata: Metadata = {
  title: 'Skill Validation Queue | RoleReady Mentor',
  description: 'Review and validate user skills.',
};

export default function ValidationQueuePage() {
  return <ValidationQueueClient />;
}
