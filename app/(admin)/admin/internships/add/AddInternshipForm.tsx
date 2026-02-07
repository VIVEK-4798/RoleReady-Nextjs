/**
 * Add Internship Form Component
 * 
 * Modern form for creating new internship listings with enhanced UX.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
}

export default function AddInternshipForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: '',
    city: '',
    stipend: '',
    duration: '',
    type: 'Full-time',
    workDetail: '',
    description: '',
    requirements: '',
    contactEmail: '',
    contactPhone: '',
    applicationUrl: '',
    skills: '',
  });

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories/internships?limit=100');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.stipend.trim()) newErrors.stipend = 'Stipend is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.workDetail.trim()) newErrors.workDetail = 'Work detail is required';
    
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/admin/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Internship created successfully!');
        router.push('/admin/internships');
      } else {
        alert(data.error || 'Failed to create internship');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Progress steps
  const steps = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'details', label: 'Details', icon: '📝' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Internship</h1>
            <p className="mt-1 text-gray-600">Fill in the details to create a new internship listing</p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveSection(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === step.id
                      ? 'bg-gradient-to-r from-[#5693C1] to-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-6 h-0.5 bg-gray-300 mx-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Form Content */}
        <div className="p-6 md:p-8">
          {activeSection === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Internship Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Full Stack Developer Intern"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => {
                      setFormData({ ...formData, company: e.target.value });
                      if (errors.company) setErrors({ ...errors, company: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., TechCorp Inc."
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., San Francisco"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveSection('details')}
                  className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {activeSection === 'details' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Internship Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stipend */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Stipend *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stipend}
                    onChange={(e) => {
                      setFormData({ ...formData, stipend: e.target.value });
                      if (errors.stipend) setErrors({ ...errors, stipend: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                      errors.stipend ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., $2000/month"
                  />
                  {errors.stipend && (
                    <p className="text-sm text-red-600">{errors.stipend}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => {
                      setFormData({ ...formData, duration: e.target.value });
                      if (errors.duration) setErrors({ ...errors, duration: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 3 months"
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Work Detail */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Work Detail *
                </label>
                <input
                  type="text"
                  required
                  value={formData.workDetail}
                  onChange={(e) => {
                    setFormData({ ...formData, workDetail: e.target.value });
                    if (errors.workDetail) setErrors({ ...errors, workDetail: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                    errors.workDetail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Brief summary of work (e.g., Build and maintain web applications)"
                />
                {errors.workDetail && (
                  <p className="text-sm text-red-600">{errors.workDetail}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  placeholder="Detailed description of the internship opportunity..."
                />
              </div>

              {/* Requirements */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Requirements & Skills
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  placeholder="Required skills, qualifications, and experience..."
                />
              </div>

              {/* Navigation */}
              <div className="pt-6 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('contact')}
                  className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Continue to Contact
                </button>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Email */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, contactEmail: e.target.value });
                      if (errors.contactEmail) setErrors({ ...errors, contactEmail: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                      errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="contact@company.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Application URL */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Application URL
                  </label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    placeholder="https://company.com/apply"
                  />
                </div>

                {/* Required Skills */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Required Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    placeholder="React, Node.js, MongoDB, AWS"
                  />
                </div>
              </div>

              {/* Summary Preview */}
              <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Title:</span>
                    <span className="ml-2 font-medium">{formData.title || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Company:</span>
                    <span className="ml-2 font-medium">{formData.company || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{formData.city || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stipend:</span>
                    <span className="ml-2 font-medium">{formData.stipend || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Final Actions */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('details')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Internship...
                    </span>
                  ) : (
                    'Create Internship'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}