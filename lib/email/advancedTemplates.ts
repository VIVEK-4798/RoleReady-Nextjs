/**
 * Advanced Email Templates - Part 2
 * 
 * Additional templates for retention and lifecycle emails
 */

import type {
    MentorSkillRejectedMetadata,
    RoadmapCreatedMetadata,
    UserInactiveMetadata,
    PlacementSeasonAlertMetadata,
    WeeklyProgressDigestMetadata,
} from '@/types/email-events';
import type { EmailTemplate } from '@/types/email-events';

const APP_NAME = 'RoleReady';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BRAND_COLOR = '#5693C1';

/**
 * MENTOR_SKILL_REJECTED Template
 */
export function getMentorSkillRejectedTemplate(
    userName: string,
    metadata: MentorSkillRejectedMetadata
): EmailTemplate {
    const { skillName, mentorName, rejectionNote } = metadata;
    const mentorText = mentorName ? mentorName : 'A mentor';

    return {
        subject: `Feedback on your ${skillName} skill`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">💪</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Keep Growing!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${mentorText} has reviewed your <strong style="color: ${BRAND_COLOR};">${skillName}</strong> skill and provided feedback to help you improve.
                      </p>
                      
                      ${rejectionNote ? `
                      <!-- Feedback Box -->
                      <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 10px; color: #f59e0b; font-size: 16px;">Mentor Feedback:</h3>
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          "${rejectionNote}"
                        </p>
                      </div>
                      ` : ''}
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Don't be discouraged! This is an opportunity to strengthen your skills and come back even stronger.
                      </p>
                      
                      <!-- Action Steps -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; color: ${BRAND_COLOR}; font-size: 16px;">Next Steps:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Review the mentor's feedback carefully</li>
                          <li>Check your personalized roadmap for learning resources</li>
                          <li>Practice and improve your skills</li>
                          <li>Request validation again when you're ready</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard/roadmap" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Your Roadmap
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>Every expert was once a beginner. Keep learning!</em>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="${APP_URL}" style="color: ${BRAND_COLOR}; text-decoration: none;">Visit Website</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    };
}

/**
 * ROADMAP_CREATED Template
 */
export function getRoadmapCreatedTemplate(
    userName: string,
    metadata: RoadmapCreatedMetadata
): EmailTemplate {
    const { roleName, stepCount } = metadata;
    const steps = stepCount || 'several';

    return {
        subject: `Your ${roleName} roadmap is ready! 🗺️`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🗺️</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Roadmap is Ready!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Great news! We've created a personalized learning roadmap for your <strong style="color: ${BRAND_COLOR};">${roleName}</strong> journey with ${steps} actionable steps.
                      </p>
                      
                      <!-- Roadmap Info -->
                      <div style="background: linear-gradient(135deg, #f0f7fc 0%, #e6f2fa 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
                        <h3 style="margin: 0 0 10px; color: ${BRAND_COLOR}; font-size: 20px;">Your Path to Success</h3>
                        <p style="margin: 0; color: #666666; font-size: 14px;">
                          A step-by-step guide tailored to your current skills and target role
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Each step includes resources, exercises, and milestones to help you progress efficiently toward becoming role-ready.
                      </p>
                      
                      <!-- Features -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; color: ${BRAND_COLOR}; font-size: 16px;">Your Roadmap Includes:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Prioritized learning paths based on skill gaps</li>
                          <li>Curated resources and tutorials</li>
                          <li>Practice exercises and projects</li>
                          <li>Progress tracking and milestones</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard/roadmap" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              Start Step 1
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>The journey of a thousand miles begins with a single step!</em>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="${APP_URL}" style="color: ${BRAND_COLOR}; text-decoration: none;">Visit Website</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    };
}

/**
 * USER_INACTIVE Templates (7, 14, 30 days)
 */
export function getUserInactiveTemplate(
    userName: string,
    metadata: UserInactiveMetadata,
    days: 7 | 14 | 30
): EmailTemplate {
    const messages = {
        7: {
            subject: `We miss you! Come back to ${APP_NAME} 👋`,
            emoji: '👋',
            title: 'We Miss You!',
            message: "It's been a week since we last saw you. Your career goals are waiting!",
            urgency: 'low',
        },
        14: {
            subject: `Don't lose momentum on your career journey! 🚀`,
            emoji: '🚀',
            title: 'Keep Your Momentum!',
            message: "Two weeks away can slow your progress. Let's get you back on track!",
            urgency: 'medium',
        },
        30: {
            subject: `Your career goals need you! Time to come back 🎯`,
            emoji: '⏰',
            title: 'Time to Resume Your Journey!',
            message: "It's been a month! Don't let your career goals slip away. Your future self will thank you for starting today.",
            urgency: 'high',
        },
    };

    const config = messages[days];

    return {
        subject: config.subject,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">${config.emoji}</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${config.title}</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${config.message}
                      </p>
                      
                      <!-- Motivation Box -->
                      <div style="background: linear-gradient(135deg, #f0f7fc 0%, #e6f2fa 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 15px;">💪</div>
                        <h3 style="margin: 0 0 10px; color: ${BRAND_COLOR}; font-size: 20px;">Your Progress is Waiting</h3>
                        <p style="margin: 0; color: #666666; font-size: 14px;">
                          Every day you invest in yourself brings you closer to your dream role
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Just ${days === 7 ? '10 minutes' : days === 14 ? '15 minutes' : '20 minutes'} today can make a difference:
                      </p>
                      
                      <!-- Quick Actions -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Update your skill levels</li>
                          <li>Complete one roadmap step</li>
                          <li>Request skill validation from a mentor</li>
                          <li>Check your readiness score</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              Continue Your Journey
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>The best time to start was yesterday. The next best time is now!</em>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="${APP_URL}" style="color: ${BRAND_COLOR}; text-decoration: none;">Visit Website</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    };
}

/**
 * PLACEMENT_SEASON_ALERT Template
 */
export function getPlacementSeasonAlertTemplate(
    userName: string,
    metadata: PlacementSeasonAlertMetadata
): EmailTemplate {
    const { season, year } = metadata;
    const seasonText = season && year ? `${season} ${year}` : 'upcoming';

    return {
        subject: `Placement season is here! Are you ready? 🎯`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Placement Season Alert!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        The ${seasonText} placement season is approaching! Now is the perfect time to ensure you're fully prepared to land your dream role.
                      </p>
                      
                      <!-- Alert Box -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 30px; margin: 30px 0; border-radius: 8px;">
                        <h3 style="margin: 0 0 10px; color: #92400e; font-size: 18px;">⏰ Time to Prepare!</h3>
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          Companies are actively hiring. Make sure your skills are validated and your readiness score is high!
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Here's how ${APP_NAME} can help you stand out:
                      </p>
                      
                      <!-- Preparation Steps -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Verify your readiness score is above 70%</li>
                          <li>Get your key skills validated by mentors</li>
                          <li>Complete your personalized roadmap</li>
                          <li>Update your resume with validated skills</li>
                          <li>Practice with mock interviews</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              Check Your Readiness
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>Preparation is the key to success. Start today!</em>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="${APP_URL}" style="color: ${BRAND_COLOR}; text-decoration: none;">Visit Website</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    };
}

/**
 * WEEKLY_PROGRESS_DIGEST Template
 */
export function getWeeklyProgressDigestTemplate(
    userName: string,
    metadata: WeeklyProgressDigestMetadata
): EmailTemplate {
    const {
        currentScore,
        scoreChange,
        skillsValidated,
        activitiesCompleted,
        roleName,
    } = metadata;

    const hasProgress = (scoreChange && scoreChange > 0) || (skillsValidated && skillsValidated > 0) || (activitiesCompleted && activitiesCompleted > 0);

    return {
        subject: `Your weekly progress summary 📊`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Weekly Progress</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Here's a summary of your progress this week${roleName ? ` for <strong style="color: ${BRAND_COLOR};">${roleName}</strong>` : ''}:
                      </p>
                      
                      ${hasProgress ? `
                      <!-- Stats Grid -->
                      <div style="background: linear-gradient(135deg, #f0f7fc 0%, #e6f2fa 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            ${currentScore !== undefined ? `
                            <td width="33%" style="text-align: center; padding: 10px;">
                              <div style="font-size: 32px; font-weight: bold; color: ${BRAND_COLOR}; margin-bottom: 5px;">${Math.round(currentScore)}%</div>
                              <div style="color: #666666; font-size: 12px;">Readiness Score</div>
                            </td>
                            ` : ''}
                            ${scoreChange !== undefined && scoreChange > 0 ? `
                            <td width="33%" style="text-align: center; padding: 10px;">
                              <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 5px;">+${Math.round(scoreChange)}%</div>
                              <div style="color: #666666; font-size: 12px;">Score Change</div>
                            </td>
                            ` : ''}
                            ${skillsValidated !== undefined && skillsValidated > 0 ? `
                            <td width="33%" style="text-align: center; padding: 10px;">
                              <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 5px;">${skillsValidated}</div>
                              <div style="color: #666666; font-size: 12px;">Skills Validated</div>
                            </td>
                            ` : ''}
                          </tr>
                        </table>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${scoreChange && scoreChange > 0 ? 'Great job on improving your readiness score! ' : ''}
                        ${skillsValidated && skillsValidated > 0 ? `You got ${skillsValidated} skill${skillsValidated > 1 ? 's' : ''} validated this week. ` : ''}
                        Keep up the momentum!
                      </p>
                      ` : `
                      <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          We didn't see much activity this week. Remember, consistent progress leads to success!
                        </p>
                      </div>
                      `}
                      
                      <!-- Next Steps -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; color: ${BRAND_COLOR}; font-size: 16px;">This Week's Goals:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Complete at least one roadmap step</li>
                          <li>Add or update 2-3 skills</li>
                          <li>Request validation for your top skills</li>
                          <li>Check your readiness score</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>Small steps every week lead to big achievements!</em>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="${APP_URL}/settings" style="color: ${BRAND_COLOR}; text-decoration: none;">Manage Email Preferences</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    };
}
