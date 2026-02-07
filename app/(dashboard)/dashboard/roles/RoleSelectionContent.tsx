/**
 * Role Selection Content Component
 *
 * Allows users to:
 * - View all available roles with descriptions and required skills
 * - Select a target role
 * - Change target role (which resets dashboard readiness data)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { SkeletonPage } from '@/components/ui';

interface Role {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  skillCount?: number;
  benchmarks?: {
    skillId: string;
    skillName: string;
    importance: string;
    weight: number;
    requiredLevel: string;
  }[];
}

interface CurrentTargetRole {
  id: string;
  roleId: string;
  roleName: string;
  isPrimary: boolean;
}

export default function RoleSelectionContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState<CurrentTargetRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError('');
      const [rolesRes, targetRes] = await Promise.all([
        fetch('/api/roles?withBenchmarks=true'),
        fetch(`/api/users/${user.id}/target-role`),
      ]);
      const [rolesData, targetData] = await Promise.all([
        rolesRes.json(),
        targetRes.json(),
      ]);
      
      if (!rolesRes.ok) {
        throw new Error(rolesData.error || 'Failed to load roles');
      }
      
      if (!targetRes.ok) {
        throw new Error(targetData.error || 'Failed to load current role');
      }
      
      if (rolesData.success) {
        setRoles(rolesData.data || []);
      }
      if (targetData.success && targetData.hasActiveRole && targetData.targetRole) {
        setCurrentRole(targetData.targetRole);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchData();
    }
  }, [authLoading, user?.id, fetchData]);

  const handleRoleSelect = (role: Role) => {
    if (currentRole && currentRole.roleId !== role._id) {
      setSelectedRole(role);
      setShowConfirmModal(true);
    } else {
      saveTargetRole(role);
    }
  };

  const saveTargetRole = async (role: Role, resetData: boolean = false) => {
    if (!user?.id) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/users/${user.id}/target-role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role._id,
          notes: resetData ? 'Changed from role selection page' : undefined,
        }),
      });
      const data = await response.json();
      if (data.success || data.changed !== undefined) {
        setCurrentRole({
          id: data.targetRole?.id || data.data?.id,
          roleId: role._id,
          roleName: role.name,
          isPrimary: true,
        });
        setShowConfirmModal(false);
        setSelectedRole(null);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to save target role');
      }
    } catch (err) {
      console.error('Error saving target role:', err);
      setError('Failed to save target role');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRoleDetails = (roleId: string) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  if (authLoading || isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="py-8 px-6 rounded-xl bg-white shadow-sm border border-gray-200 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center">
          <span className="text-3xl text-white">🎯</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-gray-900">
          {currentRole ? 'Change Your Target Role' : 'Select Your Target Role'}
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          {currentRole
            ? `Currently targeting: ${currentRole.roleName}. Select a different role to change your focus.`
            : 'Choose a role to view your readiness dashboard and track your preparation progress.'}
        </p>
        {currentRole && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5693C1]/10 text-[#5693C1] rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Current: {currentRole.roleName}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {roles.length === 0 && !error ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#5693C1] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available roles...</p>
        </div>
      ) : (
        <>
          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const isCurrentRole = currentRole?.roleId === role._id;
              const isExpanded = expandedRole === role._id;
              const requiredSkills = role.benchmarks?.filter(b => b.importance === 'required') || [];
              const optionalSkills = role.benchmarks?.filter(b => b.importance === 'optional') || [];

              return (
                <div
                  key={role._id}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden hover:shadow-md ${
                    isCurrentRole
                      ? 'border-[#5693C1] ring-2 ring-[#5693C1]/20'
                      : 'border-gray-200 hover:border-[#5693C1]'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[#5693C1]/10 text-[#5693C1]">
                        💼
                      </div>
                      {isCurrentRole && (
                        <span className="px-3 py-1 bg-[#5693C1]/10 text-[#5693C1] text-xs font-semibold rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{role.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        {requiredSkills.length} required
                      </span>
                      <span className="flex items-center gap-1">
                        {optionalSkills.length} optional
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRoleSelect(role)}
                        disabled={isSaving || isCurrentRole}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isCurrentRole
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#5693C1] hover:bg-[#4a80b0] text-white focus:ring-[#5693C1]'
                        }`}
                      >
                        {isCurrentRole ? 'Selected' : 'Select Role'}
                      </button>
                      <button
                        onClick={() => toggleRoleDetails(role._id)}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 focus:border-transparent"
                        title="View required skills"
                        aria-label={isExpanded ? "Hide role details" : "Show role details"}
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && role.benchmarks && role.benchmarks.length > 0 && (
                    <div className="px-6 pb-6 pt-0 border-t border-gray-200">
                      <div className="pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {requiredSkills.map((skill) => (
                            <span
                              key={skill.skillId}
                              className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200"
                            >
                              {skill.skillName}
                              <span className="ml-1 text-red-500">({skill.requiredLevel})</span>
                            </span>
                          ))}
                          {requiredSkills.length === 0 && (
                            <span className="text-sm text-gray-500">No required skills specified</span>
                          )}
                        </div>
                        {optionalSkills.length > 0 && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Optional Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {optionalSkills.slice(0, 6).map((skill) => (
                                <span
                                  key={skill.skillId}
                                  className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full border border-gray-200"
                                >
                                  {skill.skillName}
                                </span>
                              ))}
                              {optionalSkills.length > 6 && (
                                <span className="px-2 py-1 text-gray-500 text-xs">
                                  +{optionalSkills.length - 6} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Text */}
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              You can change your target role anytime from your dashboard or profile settings
            </p>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Change Target Role?</h3>
              <p className="text-gray-600">
                You are about to change from <strong className="text-[#5693C1]">{currentRole?.roleName}</strong> to <strong className="text-[#5693C1]">{selectedRole.name}</strong>.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Changing your target role will reset your current readiness data for the previous role. Your skills and profile data will remain unchanged.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedRole(null);
                }}
                disabled={isSaving}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={() => saveTargetRole(selectedRole, true)}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-[#5693C1] text-white rounded-lg font-medium hover:bg-[#4a80b0] transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#5693C1]/10 rounded-lg">
            <svg className="w-6 h-6 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How Target Roles Work</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-[#5693C1] mt-1">•</span>
                <span>Selecting a role helps focus your skill development</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5693C1] mt-1">•</span>
                <span>Your readiness score is calculated based on role requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5693C1] mt-1">•</span>
                <span>You can change roles anytime as your career goals evolve</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}