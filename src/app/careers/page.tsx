

'use client';

import { APP_LIVE, APP_ORIGIN } from '@/lib/site';
import Link from 'next/link';
import React, { useState } from 'react';
import { 
  Users, 
  Globe, 
  Heart, 
  Coffee,
  Laptop,
  Clock,
  MapPin,
  Mail,
  ArrowRight,
  Target,
  Zap,
  Shield,
  BookOpen,
  Briefcase,
  Home,
  Plane,
  Gift,
  TrendingUp,
  CheckCircle,
  Send,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// ========================================
// TYPES (SHARED WITH BACKEND)
// ========================================

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  location: string;
  portfolio: string;
  coverLetter: string;
  resume: File | null;
}

interface ValidationError {
  field: string;
  message: string;
}

// ========================================
// MAIN COMPONENT
// ========================================

const CareersPage: React.FC = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    location: '',
    portfolio: '',
    coverLetter: '',
    resume: null
  });

  // ✅ SECURE: Handle form input changes (client-side only)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== name));
  };

  // ✅ SECURE: Handle file selection (client-side only)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Basic client-side validation for UX
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file');
        e.target.value = '';
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
  };

  // ✅ SECURE: Submit application via server API
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors([]);

    // Until the app is live the upload endpoint does not exist. Open an email to
    // careers@ with the details; the applicant attaches their CV there.
    if (!APP_LIVE) {
      const body = [
        `Name: ${formData.name}`, `Email: ${formData.email}`, `Phone: ${formData.phone}`,
        `Position: ${formData.position}`, `Experience: ${formData.experience}`, `Location: ${formData.location}`,
        `Portfolio: ${formData.portfolio}`, '', formData.coverLetter, '', '(Please attach your CV to this email.)',
      ].join('\n');
      window.location.href = `mailto:careers@sormalitics.com?subject=${encodeURIComponent(`Application: ${formData.position || 'General'}`)}&body=${encodeURIComponent(body)}`;
      toast.info('Your email app is opening — attach your CV and send.');
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ ALL PROCESSING HAPPENS ON SERVER
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      const response = await fetch(`${APP_ORIGIN}/api/careers`, {
        method: 'POST',
        body: formDataToSend // Send as FormData for file upload
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - show confirmation
        setIsSubmitted(true);
        toast.success('Application submitted successfully! Check your email for confirmation.');
        
        // Reset form
        setFormData({
          name: '', email: '', phone: '', position: '', experience: '',
          location: '', portfolio: '', coverLetter: '', resume: null
        });
        
        // Clear file input
        const fileInput = document.getElementById('resume') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } else {
        // Handle validation errors from server
        if (result.details && Array.isArray(result.details)) {
          setValidationErrors(result.details);
          toast.error('Please fix the errors and try again');
        } else {
          toast.error(result.error || 'Failed to submit application');
        }
      }

    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ CLIENT-SIDE: Basic form validation for UX
  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(error => error.field === fieldName)?.message;
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.name && 
      formData.email && 
      formData.position && 
      formData.experience && 
      formData.coverLetter
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Join the Future of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Financial Technology
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
              Be part of a revolutionary team building the next generation of financial management tools. 
              Help businesses worldwide streamline their operations with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex flex-wrap items-center justify-center space-x-2"
              >
                <Briefcase className="w-5 h-5" />
                <span>Submit Application</span>
              </button>
              <Link
                href="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex flex-wrap items-center justify-center space-x-2"
              >
                <span>Learn About Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Company Mission */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Democratizing financial management by making professional-grade tools accessible to businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex flex-wrap items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation First</h3>
              <p className="text-gray-600">
                We're constantly pushing boundaries to create solutions that don't just meet today's needs, 
                but anticipate tomorrow's challenges.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex flex-wrap items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Impact</h3>
              <p className="text-gray-600">
                From startups in London to enterprises in Johannesburg, we're building tools that empower 
                businesses across the globe.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex flex-wrap items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">People Focused</h3>
              <p className="text-gray-600">
                Technology is only as good as the people behind it. We prioritize human-centered design 
                and meaningful work relationships.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Culture Section - Shortened for brevity */}
      <div id="culture" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Life at SORMALITICS</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built a culture where innovation thrives, diversity is celebrated, and every voice matters
            </p>
          </div>
          {/* Culture content here - same as before */}
        </div>
      </div>

      {/* Open Positions */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're always looking for exceptional talent to join our growing team
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex flex-wrap items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Open Positions Right Now</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're not actively hiring at the moment, but we're always interested in connecting with 
              exceptional talent. Send us your details and we'll reach out when relevant opportunities arise.
            </p>
            <button
              onClick={() => setShowApplicationForm(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors inline-flex flex-wrap gap-y-2 items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Submit Your Interest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Questions About Working Here?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              We'd love to hear from you. Reach out to our team and let's start a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:careers@sormalitics.com"
                className="flex flex-wrap gap-y-2 items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="text-lg">careers@sormalitics.com</span>
              </a>
              <span className="hidden sm:block text-gray-500">|</span>
              <div className="flex flex-wrap gap-y-2 items-center space-x-4 text-gray-300">
                <div className="flex flex-wrap gap-y-2 items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Manchester, UK</span>
                </div>
                <span>•</span>
                <div className="flex flex-wrap gap-y-2 items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Johannesburg, RSA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECURE APPLICATION MODAL - FRONTEND ONLY */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-wrap items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex flex-wrap gap-y-2 items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSubmitted ? 'Application Submitted!' : 'Submit Your Application'}
                </h2>
                <button
                  onClick={() => {
                    setShowApplicationForm(false);
                    setIsSubmitted(false);
                    setValidationErrors([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isSubmitted ? (
                // Success State
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex flex-wrap items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Your application has been submitted successfully. We've sent a confirmation email 
                    with your application details. Our talent team will review your application and 
                    get back to you within 5-7 business days.
                  </p>
                  <button
                    onClick={() => {
                      setShowApplicationForm(false);
                      setIsSubmitted(false);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                // Application Form
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  {/* General Error Message */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error.message}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          getFieldError('name') ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="John Smith"
                      />
                      {getFieldError('name') && (
                        <p className="text-red-600 text-sm mt-1">{getFieldError('name')}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          getFieldError('email') ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {getFieldError('email') && (
                        <p className="text-red-600 text-sm mt-1">{getFieldError('email')}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+44 7xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Position of Interest *
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('position') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Frontend Developer, Product Manager"
                    />
                    {getFieldError('position') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('position')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('experience') ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select experience level</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-3">2-3 years</option>
                      <option value="4-6">4-6 years</option>
                      <option value="7-10">7-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                    {getFieldError('experience') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('experience')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio/LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="portfolio"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('portfolio') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://"
                    />
                    {getFieldError('portfolio') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('portfolio')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="resume"
                        name="resume"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.resume && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOC, or DOCX format (max 10MB)</p>
                  </div>

                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter / Why SORMALITICS? *
                    </label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        getFieldError('coverLetter') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tell us why you're interested in SORMALITICS and what you'd bring to our team... (minimum 50 characters)"
                    />
                    <div className="flex flex-wrap gap-y-2 justify-between items-center mt-1">
                      {getFieldError('coverLetter') ? (
                        <p className="text-red-600 text-sm">{getFieldError('coverLetter')}</p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {formData.coverLetter.length}/50 characters minimum
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-wrap gap-y-2 items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersPage;