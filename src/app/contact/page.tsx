'use client';

import { APP_LIVE, APP_ORIGIN, APP_URL } from '@/lib/site';
import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Globe,
  Building2,
  User,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  preferredContact: 'email' | 'phone';
  region: 'uk' | 'rsa';
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    region: 'uk'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const honeypot = ((e.currentTarget as HTMLFormElement).elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';
    setIsSubmitting(true);

    if (!APP_LIVE) {
      const body = [
        `Name: ${formData.name}`, `Email: ${formData.email}`, `Company: ${formData.company}`,
        `Phone: ${formData.phone}`, `Preferred contact: ${formData.preferredContact}`, '', formData.message,
      ].join('\n');
      window.location.href = `mailto:hello@sormalitics.com?subject=${encodeURIComponent(formData.subject || 'Website enquiry')}&body=${encodeURIComponent(body)}`;
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${APP_ORIGIN}/api/contact/submit`, {
        method: 'POST',
        body: (() => { const fd = new FormData(); Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v))); if (honeypot) fd.append('website', honeypot); return fd; })()
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: '',
          message: '',
          preferredContact: 'email',
          region: 'uk'
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your financial operations? We're here to help you get started with SORMALITICS.
          </p>
        </div>
      </div>

      <div className="relative -mt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                <div className="max-w-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Contact Information
                  </h2>
                  
                  <div className="flex items-start space-x-4 mb-8">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex flex-wrap items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Us</h3>
                      <p className="text-gray-600 mb-2">Send us a message anytime</p>
                      <a 
                        href="mailto:inquiries@sormalitics.com"
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        inquiries@sormalitics.com
                      </a>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex flex-wrap items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">UK Office</h3>
                        <p className="text-gray-600 mb-2">Monday - Friday, 9AM - 5PM GMT</p>
                        <a 
                          href="tel:+447425054983"
                          className="text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                          +44 7425 054983
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-orange-600 rounded-lg flex flex-wrap items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">South Africa Office</h3>
                        <p className="text-gray-600 mb-2">Monday - Friday, 8AM - 5PM SAST</p>
                        <a 
                          href="tel:+27679211947"
                          className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                          +27 067 921 1947
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                      Our Offices
                    </h3>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">United Kingdom</h4>
                          <address className="text-gray-600 not-italic leading-relaxed">
                            26 Cedar Avenue<br />
                            Heywood<br />
                            Manchester<br />
                            United Kingdom
                          </address>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">South Africa</h4>
                          <address className="text-gray-600 not-italic leading-relaxed">
                            28 Anrickle Place<br />
                            30 Kiaat Street<br />
                            Noordwyk, Midrand<br />
                            Johannesburg<br />
                            South Africa
                          </address>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Send us a Message
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex flex-wrap items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                    <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
                  </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          maxLength={120}
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          maxLength={254}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          maxLength={160}
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Your Company Ltd"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          maxLength={40}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+44 7xxx xxx xxx"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Office
                        </label>
                        <select
                          id="region"
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="uk">United Kingdom</option>
                          <option value="rsa">South Africa</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Contact Method
                        </label>
                        <select
                          id="preferredContact"
                          name="preferredContact"
                          value={formData.preferredContact}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        maxLength={160}
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        maxLength={5000}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        placeholder="Tell us about your requirements or questions..."
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex flex-wrap items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about SORMALITICS
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What is SORMALITICS?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                SORMALITICS is a comprehensive financial management platform that helps businesses generate professional invoices, payslips, agreements, and manage their financial operations efficiently.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How quickly can I get started?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                You can get started immediately! Our platform is designed for quick setup, and our team can help you migrate your existing data within 24-48 hours.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Do you offer support?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! We provide comprehensive support through email, phone, and live chat. Our support team is available during business hours in both UK and South Africa.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Is my data secure?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. We use enterprise-grade security measures, including encryption, secure data centers, and regular security audits to protect your financial data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using SORMALITICS to streamline their financial operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${APP_URL}/auth/register`}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex flex-wrap items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex flex-wrap items-center justify-center space-x-2"
            >
              <span>Schedule Demo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;