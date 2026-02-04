import { Metadata } from 'next';
import MentorJobsClient from './MentorJobsClient';

export const metadata: Metadata = {
  title: 'Jobs | Mentor Dashboard',
  description: 'Manage job listings',
};

export default function MentorJobsPage() {
  return <MentorJobsClient/>;
}
