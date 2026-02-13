/**
 * Email Template Factory
 * 
 * Generates email templates for lifecycle events
 */

import type {
    EmailEventType,
    EmailEventMetadata,
    EmailTemplate,
    RoleSelectedMetadata,
    ReadinessFirstMetadata,
    ReadinessMajorImprovementMetadata,
    MentorSkillValidatedMetadata,
} from '@/types/email-events';

const APP_NAME = 'RoleReady';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BRAND_COLOR = '#5693C1';

/**
 * Get email template for a specific event
 */
export function getTemplate(
    event: EmailEventType,
    metadata: EmailEventMetadata = {},
    userName: string = 'there'
): EmailTemplate {
    switch (event) {
        case 'WELCOME_USER':
            return getWelcomeUserTemplate(userName);

        case 'ROLE_SELECTED':
            return getRoleSelectedTemplate(userName, metadata as RoleSelectedMetadata);

        case 'READINESS_FIRST':
            return getReadinessFirstTemplate(userName, metadata as ReadinessFirstMetadata);

        case 'READINESS_MAJOR_IMPROVEMENT':
            return getReadinessMajorImprovementTemplate(userName, metadata as ReadinessMajorImprovementMetadata);

        case 'MENTOR_SKILL_VALIDATED':
            return getMentorSkillValidatedTemplate(userName, metadata as MentorSkillValidatedMetadata);

        default:
            throw new Error(`Unknown email event: ${event}`);
    }
}

/**
 * WELCOME_USER Template
 */
function getWelcomeUserTemplate(userName: string): EmailTemplate {
    return {
        subject: `Welcome to ${APP_NAME}! 🎉`,
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
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Welcome to ${APP_NAME}! 🎉</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We're thrilled to have you join ${APP_NAME}! You've just taken the first step toward accelerating your career growth.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Here's how to get started:
                      </p>
                      
                      <!-- Action Steps -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                        <div style="margin-bottom: 15px;">
                          <strong style="color: ${BRAND_COLOR};">1. Complete Your Profile</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Add your experience, education, and skills to get personalized recommendations.</p>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                          <strong style="color: ${BRAND_COLOR};">2. Select Your Target Role</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Choose the role you're preparing for to see your readiness score.</p>
                        </div>
                        
                        <div>
                          <strong style="color: ${BRAND_COLOR};">3. Upload Your Resume</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">We'll automatically extract your skills and experience to save you time.</p>
                        </div>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        If you have any questions, feel free to reach out. We're here to help!
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
 * ROLE_SELECTED Template
 */
function getRoleSelectedTemplate(userName: string, metadata: RoleSelectedMetadata): EmailTemplate {
    const { roleName } = metadata;

    return {
        subject: `You've selected ${roleName} as your target role! 🎯`,
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
                      <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Target Role Selected!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Great choice! You've selected <strong style="color: ${BRAND_COLOR};">${roleName}</strong> as your target role.
                      </p>
                      
                      <!-- Info Box -->
                      <div style="background-color: #f0f7fc; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 15px; color: ${BRAND_COLOR}; font-size: 18px;">What is Readiness?</h3>
                        <p style="margin: 0 0 10px; color: #333333; font-size: 14px; line-height: 1.6;">
                          Your <strong>readiness score</strong> measures how prepared you are for your target role based on:
                        </p>
                        <ul style="margin: 10px 0 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Required skills for the role</li>
                          <li>Your current skill levels</li>
                          <li>Skill validation by mentors</li>
                          <li>Importance weighting of each skill</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We'll track your progress and show you exactly which skills to focus on to increase your readiness score.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Your Readiness
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>Tip: Add your skills and get them validated by mentors to improve your score!</em>
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
 * READINESS_FIRST Template
 */
function getReadinessFirstTemplate(userName: string, metadata: ReadinessFirstMetadata): EmailTemplate {
    const { score, roleName } = metadata;
    const scorePercent = Math.round(score);

    return {
        subject: `Your ${roleName} readiness score: ${scorePercent}% 📊`,
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
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Readiness Score</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Your readiness score for <strong style="color: ${BRAND_COLOR};">${roleName}</strong> has been calculated!
                      </p>
                      
                      <!-- Score Display -->
                      <div style="background: linear-gradient(135deg, #f0f7fc 0%, #e6f2fa 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 64px; font-weight: bold; color: ${BRAND_COLOR}; margin-bottom: 10px;">
                          ${scorePercent}%
                        </div>
                        <div style="color: #666666; font-size: 16px;">
                          Current Readiness Score
                        </div>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        This score reflects how well your current skills match the requirements for ${roleName}.
                      </p>
                      
                      <!-- Improvement Tips -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 15px; color: ${BRAND_COLOR}; font-size: 18px;">How to Improve:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Add missing required skills to your profile</li>
                          <li>Improve your skill levels through practice</li>
                          <li>Get your skills validated by mentors</li>
                          <li>Focus on high-weight skills first</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Detailed Breakdown
                            </a>
                          </td>
                        </tr>
                      </table>
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
 * READINESS_MAJOR_IMPROVEMENT Template
 */
function getReadinessMajorImprovementTemplate(
    userName: string,
    metadata: ReadinessMajorImprovementMetadata
): EmailTemplate {
    const { oldScore, newScore, roleName } = metadata;
    const oldPercent = Math.round(oldScore);
    const newPercent = Math.round(newScore);
    const improvement = newPercent - oldPercent;

    // Special milestones
    const crossed70 = oldScore < 70 && newScore >= 70;
    const crossed80 = oldScore < 80 && newScore >= 80;

    let milestoneMessage = '';
    let emoji = '🎉';

    if (crossed80) {
        milestoneMessage = '<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;"><strong style="font-size: 18px;">🏆 Outstanding! You\'ve crossed 80% readiness!</strong><p style="margin: 10px 0 0; font-size: 14px;">You\'re highly prepared for this role!</p></div>';
        emoji = '🏆';
    } else if (crossed70) {
        milestoneMessage = '<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;"><strong style="font-size: 18px;">🌟 Excellent! You\'ve crossed 70% readiness!</strong><p style="margin: 10px 0 0; font-size: 14px;">You\'re well on your way to being role-ready!</p></div>';
        emoji = '🌟';
    }

    return {
        subject: `Great progress! Your ${roleName} readiness improved by ${improvement}% ${emoji}`,
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
                      <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Amazing Progress!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Congratulations! Your readiness score for <strong style="color: ${BRAND_COLOR};">${roleName}</strong> has significantly improved!
                      </p>
                      
                      <!-- Score Comparison -->
                      <div style="background: linear-gradient(135deg, #f0f7fc 0%, #e6f2fa 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="33%" style="text-align: center; padding: 10px;">
                              <div style="color: #999999; font-size: 14px; margin-bottom: 10px;">Previous</div>
                              <div style="font-size: 36px; font-weight: bold; color: #666666;">${oldPercent}%</div>
                            </td>
                            <td width="33%" style="text-align: center; padding: 10px;">
                              <div style="color: #10b981; font-size: 32px; font-weight: bold;">+${improvement}%</div>
                              <div style="color: #10b981; font-size: 14px; margin-top: 5px;">Improvement</div>
                            </td>
                            <td width="33%" style="text-align: center; padding: 10px;">
                              <div style="color: #999999; font-size: 14px; margin-bottom: 10px;">Current</div>
                              <div style="font-size: 36px; font-weight: bold; color: ${BRAND_COLOR};">${newPercent}%</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      ${milestoneMessage}
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Keep up the excellent work! Your dedication to skill development is paying off.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Your Progress
                            </a>
                          </td>
                        </tr>
                      </table>
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
 * MENTOR_SKILL_VALIDATED Template
 */
function getMentorSkillValidatedTemplate(
    userName: string,
    metadata: MentorSkillValidatedMetadata
): EmailTemplate {
    const { skillName, mentorName } = metadata;
    const mentorText = mentorName ? `by ${mentorName}` : 'by a mentor';

    return {
        subject: `Your ${skillName} skill has been validated! ✅`,
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
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Skill Validated!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Great news! Your <strong style="color: #10b981;">${skillName}</strong> skill has been validated ${mentorText}.
                      </p>
                      
                      <!-- Achievement Box -->
                      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 30px; margin: 30px 0; border-radius: 8px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 15px;">🏅</div>
                        <h3 style="margin: 0 0 10px; color: #10b981; font-size: 20px;">Achievement Unlocked!</h3>
                        <p style="margin: 0; color: #166534; font-size: 16px;">
                          <strong>${skillName}</strong> is now verified on your profile
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Validated skills carry more weight in your readiness score and demonstrate verified expertise to potential employers.
                      </p>
                      
                      <!-- Benefits -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; color: ${BRAND_COLOR}; font-size: 16px;">What This Means:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                          <li>Higher contribution to your readiness score</li>
                          <li>Verified badge on your skill profile</li>
                          <li>Increased credibility with employers</li>
                          <li>Recognition of your expertise</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4a80b0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Your Profile
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        💡 <em>Keep adding and validating skills to increase your readiness!</em>
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
