export const PLAN_LIMITS = {
  FREE: {
    readinessChecks: 3,
    roadmapGenerations: 1,
    resumeGenerations: 1,
    skillExtractions: 2,
    mentorRequests: 3,
    tickets: 1,
  },
  PRO: {
    readinessChecks: 25,
    roadmapGenerations: 10,
    resumeGenerations: 10,
    skillExtractions: 15,
    mentorRequests: 10,
    tickets: 5,
    monthlyReset: true,
  },
  PREMIUM: {
    unlimited: true,
    priority: true,
  },
};
