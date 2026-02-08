/**
 * Add Internship Form Component
 * 
 * Comprehensive form for creating a new internship listing with validation.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Skill {
  _id: string;
  name: string;
  category: string;
}

export default function AddInternshipForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: '',
    city: '',
    country: 'USA',
    address: '',
    stipendAmount: '',
    stipendCurrency: 'USD',
    stipendFrequency: 'month',
    duration: '',
    durationUnit: 'months',
    type: 'full-time',
    workMode: 'hybrid',
    workDetail: '',
    requirements: '',
    benefits: '',
    skills: [] as string[],
    applicationDeadline: '',
    startDate: '',
    numberOfOpenings: '1',
    isActive: true,
    isFeatured: false,
    contactEmail: '',
    applyLink: '',
  });

  // Mock data
  const mockCategories: Category[] = [
    { _id: '1', name: 'Software Development', description: 'Programming and development roles' },
    { _id: '2', name: 'Data Science', description: 'Data analysis and machine learning' },
    { _id: '3', name: 'Design', description: 'UI/UX and graphic design' },
    { _id: '4', name: 'Marketing', description: 'Digital marketing and content creation' },
    { _id: '5', name: 'Business', description: 'Management and business development' },
    { _id: '6', name: 'Research', description: 'Academic and industrial research' },
  ];

  const mockSkills: Skill[] = [
    { _id: '1', name: 'React', category: 'Software Development' },
    { _id: '2', name: 'Node.js', category: 'Software Development' },
    { _id: '3', name: 'Python', category: 'Software Development' },
    { _id: '4', name: 'TypeScript', category: 'Software Development' },
    { _id: '5', name: 'UI/UX Design', category: 'Design' },
    { _id: '6', name: 'Figma', category: 'Design' },
    { _id: '7', name: 'Data Analysis', category: 'Data Science' },
    { _id: '8', name: 'Machine Learning', category: 'Data Science' },
    { _id: '9', name: 'Digital Marketing', category: 'Marketing' },
    { _id: '10', name: 'Content Writing', category: 'Marketing' },
  ];

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In real app, fetch from API
        // const categoriesRes = await fetch('/api/categories');
        // const skillsRes = await fetch('/api/skills');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCategories(mockCategories);
        setSkills(mockSkills);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load form data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle skill selection
  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillName)) {
        return prev.filter(s => s !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
    setFormData(prev => ({
      ...prev,
      skills: selectedSkills.includes(skillName) 
        ? selectedSkills.filter(s => s !== skillName)
        : [...selectedSkills, skillName]
    }));
  };

  // Add custom skill
  const handleAddCustomSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      const newSkill = skillInput.trim();
      setSelectedSkills(prev => [...prev, newSkill]);
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setSkillInput('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skillName));
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillName)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validation
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.company.trim()) throw new Error('Company name is required');
      if (!formData.city.trim()) throw new Error('City is required');
      if (!formData.workDetail.trim()) throw new Error('Work details are required');

      // In real app, submit to API
      // const response = await fetch('/api/mentor/internships', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Internship created successfully! Redirecting to listings...');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/mentor/internships');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create internship. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total stipend
  const getTotalStipend = () => {
    if (!formData.stipendAmount) return '';
    const amount = parseFloat(formData.stipendAmount);
    if (isNaN(amount)) return '';
    
    const frequency = formData.stipendFrequency;
    if (frequency === 'month') return `${formData.stipendCurrency} ${amount}/month`;
    if (frequency === 'week') return `${formData.stipendCurrency} ${amount}/week`;
    if (frequency === 'project') return `${formData.stipendCurrency} ${amount} (project-based)`;
    return `${formData.stipendCurrency} ${amount}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5693C1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <p className="text-sm text-gray-500">Core details about the internship</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internship Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="e.g., Frontend Developer Intern"
            />
            <p className="text-xs text-gray-500 mt-1">Make it clear and descriptive</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="e.g., TechCorp Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Openings
            </label>
            <input
              type="number"
              name="numberOfOpenings"
              min="1"
              value={formData.numberOfOpenings}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="e.g., 5"
            />
          </div>
        </div>
      </div>

      {/* Location & Type */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Location & Type</h3>
            <p className="text-sm text-gray-500">Where and how the internship works</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="e.g., San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
            >
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Mode
            </label>
            <select
              name="workMode"
              value={formData.workMode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
            >
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internship Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address (Optional)
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="Full company address"
            />
          </div>
        </div>
      </div>

      {/* Stipend & Duration */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Stipend & Duration</h3>
            <p className="text-sm text-gray-500">Compensation and timeline details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stipend Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <select
                  name="stipendCurrency"
                  value={formData.stipendCurrency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              
              <div>
                <input
                  type="number"
                  name="stipendAmount"
                  value={formData.stipendAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  style={{ color: '#000000' }}
                  placeholder="Amount"
                  min="0"
                />
              </div>
              
              <div>
                <select
                  name="stipendFrequency"
                  value={formData.stipendFrequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
                >
                  <option value="month">Per Month</option>
                  <option value="week">Per Week</option>
                  <option value="project">Project Based</option>
                  <option value="stipend">Fixed Stipend</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
            
            {formData.stipendAmount && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Total Stipend:</span> {getTotalStipend()}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                style={{ color: '#000000' }}
                placeholder="e.g., 3"
                min="1"
              />
              <select
                name="durationUnit"
                value={formData.durationUnit}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent bg-white"
              >
                <option value="months">Months</option>
                <option value="weeks">Weeks</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline *
            </label>
            <input
              type="date"
              name="applicationDeadline"
              required
              value={formData.applicationDeadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Required Skills */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Required Skills</h3>
            <p className="text-sm text-gray-500">Skills and qualifications needed</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Selected Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Skills ({selectedSkills.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#5693C1]/10 to-[#4a80b0]/10 text-[#5693C1] rounded-lg border border-[#5693C1]/20"
                >
                  <span className="text-sm font-medium">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 text-[#5693C1] hover:text-[#4a80b0]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {selectedSkills.length === 0 && (
                <p className="text-gray-500 italic text-sm">No skills selected yet</p>
              )}
            </div>
          </div>

          {/* Skill Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <button
                  type="button"
                  key={skill._id}
                  onClick={() => handleSkillToggle(skill.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill.name)
                      ? 'bg-[#5693C1] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Custom Skill
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                style={{ color: '#000000' }}
                placeholder="Enter a skill not listed above"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
            <p className="text-sm text-gray-500">Responsibilities and requirements</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Details & Responsibilities *
            </label>
            <textarea
              name="workDetail"
              required
              rows={5}
              value={formData.workDetail}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent resize-none"
              style={{ color: '#000000' }}
              placeholder="Describe the internship responsibilities, daily tasks, and what the intern will learn..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about tasks and learning opportunities
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements & Qualifications
            </label>
            <textarea
              name="requirements"
              rows={4}
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent resize-none"
              style={{ color: '#000000' }}
              placeholder="List the requirements, qualifications, and prerequisites..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits & Perks
            </label>
            <textarea
              name="benefits"
              rows={3}
              value={formData.benefits}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent resize-none"
              style={{ color: '#000000' }}
              placeholder="Describe any benefits, perks, or learning opportunities..."
            />
          </div>
        </div>
      </div>

      {/* Contact & Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contact & Settings</h3>
            <p className="text-sm text-gray-500">How candidates can apply and visibility settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              name="contactEmail"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="internships@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Link
            </label>
            <input
              type="url"
              name="applyLink"
              value={formData.applyLink}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              style={{ color: '#000000' }}
              placeholder="https://company.com/careers/apply"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Make internship active
              </label>
            </div>
            <p className="text-xs text-gray-500">Active internships are visible to students</p>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1]"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                Feature this internship
              </label>
            </div>
            <p className="text-xs text-gray-500">Featured internships get highlighted placement</p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Creating Internship...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Internship
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push('/mentor/internships')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
        </button>
      </div>

      {/* Form Progress */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Form Progress</span>
          <span className="text-sm font-medium text-[#5693C1]">
            {(() => {
              const requiredFields = ['title', 'company', 'city', 'workDetail', 'applicationDeadline', 'contactEmail'];
              const filledFields = requiredFields.filter(field => 
                formData[field as keyof typeof formData]?.toString().trim()
              ).length;
              return `${Math.round((filledFields / requiredFields.length) * 100)}%`;
            })()}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#5693C1] rounded-full transition-all duration-300"
            style={{ 
              width: (() => {
                const requiredFields = ['title', 'company', 'city', 'workDetail', 'applicationDeadline', 'contactEmail'];
                const filledFields = requiredFields.filter(field => 
                  formData[field as keyof typeof formData]?.toString().trim()
                ).length;
                return `${(filledFields / requiredFields.length) * 100}%`;
              })() 
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Complete all required fields (*) to submit the form
        </p>
      </div>
    </form>
  );
}