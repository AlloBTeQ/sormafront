"use client"
import { APP_URL } from '@/lib/site';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Receipt, Calculator, PenTool, Shield, Zap, Globe, 
  CreditCard, Clock, CheckCircle, ArrowRight, Star,
  FileText, Download, Send, Users, Smartphone, 
  Building, Lock, Briefcase, DollarSign
} from 'lucide-react';

const SORMALITICSServices = () => {
  const [activeService, setActiveService] = useState('invoices');
  const router = useRouter();

  const services = [
    {
      id: 'invoices',
      icon: <Receipt className="h-12 w-12" />,
      title: 'Professional Invoice Generator',
      subtitle: 'Beautiful invoices that get paid faster',
      description: 'Create stunning, compliant invoices with automatic VAT calculations, multi-currency support, and instant delivery.',
      features: [
        'Automatic VAT/Tax calculations',
        'Multi-currency support (25+ currencies)',
        'Professional branded templates',
        'Instant PDF generation',
        'Direct email delivery',
        'Payment tracking & reminders',
        'Client management system',
        'Recurring invoice automation'
      ],
      payPerUse: '£3',
      useCases: [
        'Freelance designers billing clients',
        'Consultants invoicing for services',
        'Small businesses managing receivables',
        'International contractors'
      ],
      cta: 'Generate Invoice',
      ctaLink: '/store?category=invoice',
      ctaSecondary: 'View Templates',
      ctaSecondaryLink: '/store?category=invoice'
    },
    {
      id: 'payslips',
      icon: <Calculator className="h-12 w-12" />,
      title: 'Smart Payslip Generator',
      subtitle: 'Compliant payroll made simple',
      description: 'Generate accurate payslips with automatic tax calculations, National Insurance deductions, and comprehensive reporting.',
      features: [
        'UK/SA tax compliance',
        'Automatic PAYE calculations',
        'National Insurance deductions',
        'Year-to-date tracking',
        'Employee data management',
        'Bulk payslip generation',
        'P45/P60 generation',
        'HMRC-compliant reporting'
      ],
      payPerUse: '£5',
      useCases: [
        'Small business owners paying staff',
        'Contractors managing subcontractors',
        'Agencies handling freelancer payments',
        'Commission-based businesses'
      ],
      cta: 'Create South African Payslip',
      ctaLink: '/store',
      ctaTwo: 'Create UK Payslip',
      ctaTwoLink: '/store',
      ctaThree: 'Create Standard Payslip',
      ctaThreeLink: '/store',
      ctaSecondary: 'View Payslip Templates',
      ctaSecondaryLink: '/store?category=payslip'
    },
    {
      id: 'agreements',
      icon: <PenTool className="h-12 w-12" />,
      title: 'Agreements Templates & E-Sign',
      subtitle: 'Professional contracts with digital signatures',
      description: 'Access expertly crafted agreements templates with integrated e-signature capabilities for seamless deal closure.',
      features: [
        'Professional agreements templates',
        'Integrated e-signature platform',
        'Contract version control',
        'Deadline tracking & reminders',
        'Multi-party signing workflow',
        'Document authenticity verification',
        'Custom clause library',
        'Compliance tracking'
      ],
      
      useCases: [
        'Service agreements with clients',
        'Employment contracts',
        'Partnership agreements',
        'Non-disclosure agreements'
      ],
      cta: 'Create Agreement',
      ctaLink: '/store?category=agreement',
      ctaSecondary: 'Browse Templates',
      ctaSecondaryLink: '/store'
    }
  ];

  const additionalFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Advanced Security',
      description: 'Encryption with verification ensures document authenticity and prevents tampering.'
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-600" />,
      title: 'Global Compliance',
      description: 'Automatic compliance with UK, EU, SA, and international regulations across 25+ countries.'
    },
    {
      icon: <Smartphone className="h-8 w-8 text-blue-600" />,
      title: 'Mobile-First',
      description: 'Complete mobile app with full functionality - manage your business finances anywhere, anytime.'
    },
    {
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      title: 'Payment Integration',
      description: 'Connect with popular payment processors to accept payments directly through your documents.'
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: 'Instant Delivery',
      description: 'Generate and send professional documents in seconds with automated email delivery and tracking.'
    },
    {
      icon: <Building className="h-8 w-8 text-blue-600" />,
      title: 'Enterprise Ready',
      description: 'Scale with team management, role permissions, API access, and white-label options.'
    }
  ];

  const currentService = services.find(s => s.id === activeService);

  /**
   * CTA destinations.
   *
   * Every link on this page used to point at a URL scheme that does not exist
   * — /invoice/generate, /payslip/rsapayslip, /agreements/templates, /register.
   * Twelve of the thirteen were dead; only /pricing resolved. The real pages
   * live under /store/product/… (public, guest checkout) and /dashboard/…
   * (subscribers).
   *
   * They point at the STORE, because /services is a marketing page and most
   * people clicking are not signed in: the store sells a single document to a
   * visitor with no account, so the CTA converts instead of hitting a login
   * wall. Invoices have no dedicated product page, so they deep-link the
   * storefront filtered to the invoice shelf — which is why /store now reads
   * ?category= from the URL.
   */
  const handleCtaClick = (link: string): void => {
    // Use Next.js router for navigation
    router.push(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}


      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Professional Business Tools
            <span className="block text-yellow-300">Made Simple</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Everything you need to run your business professionally - from invoicing and payroll 
            to contracts and compliance. Pay per use or subscribe for unlimited access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleCtaClick('/store?category=invoice')}
              className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-lg text-lg transition-colors"
            >
              View Invoice Templates
            </button>
                        <button 
              onClick={() => handleCtaClick('/store?category=payslip')}
              className="px-8 py-4 bg-white/10 border border-white/60 text-white hover:bg-white/20 font-semibold rounded-lg text-lg transition-colors"
            >
             View Payslip Templates
            </button>
            <button 
              onClick={() => handleCtaClick('/pricing')}
              className="px-8 py-4 border-2 bg-cyan-400 border-blue-300 text-white hover:bg-white hover:text-blue-700 font-semibold rounded-lg text-lg transition-colors"
            >
              Pay Per Use
            </button>
          </div>
        </div>
      </div>

      {/* Services Selector */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
          <p className="text-xl text-gray-600">Professional tools designed for independent business people</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white border border-gray-200 p-2 rounded-lg flex flex-wrap justify-center max-w-full shadow-sm">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`flex items-center px-6 py-3 rounded-md font-medium transition-all ${
                  activeService === service.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{service.icon}</span>
                {service.title.split(' ')[0]} {service.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Service Details */}
        {currentService && (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    {currentService.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentService.title}</h3>
                    <p className="text-blue-600 font-medium">{currentService.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {currentService.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{currentService.payPerUse}</div>
                    <div className="text-green-700 font-medium">Pay Per Use</div>
                    <div className="text-green-600 text-sm">One-time generation & send</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">FREE</div>
                    <div className="text-blue-700 font-medium">With Subscription</div>
                    <div className="text-blue-600 text-sm">Unlimited usage</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Multiple CTA buttons for payslips */}
                  {currentService.id === 'payslips' ? (
                    <>
                      <button 
                        onClick={() => handleCtaClick(currentService.ctaLink)}
                        className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {currentService.cta}
                        <ArrowRight className="ml-2 h-5 w-5 inline" />
                      </button>
                      <button 
                        onClick={() => handleCtaClick(currentService.ctaTwoLink!)}
                        className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        {currentService.ctaTwo}
                        <ArrowRight className="ml-2 h-5 w-5 inline" />
                      </button>
                      <button 
                        onClick={() => handleCtaClick(currentService.ctaThreeLink!)}
                        className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        {currentService.ctaThree}
                        <ArrowRight className="ml-2 h-5 w-5 inline" />
                      </button>
                      <button 
                        onClick={() => handleCtaClick(currentService.ctaSecondaryLink)}
                        className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        {currentService.ctaSecondary}
                      </button>
                    </>
                  ) : (
                    /* Default layout for other services */
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => handleCtaClick(currentService.ctaLink)}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {currentService.cta}
                        <ArrowRight className="ml-2 h-5 w-5 inline" />
                      </button>
                      <button 
                        onClick={() => handleCtaClick(currentService.ctaSecondaryLink)}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        {currentService.ctaSecondary}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentService.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Perfect For</h4>
                <div className="space-y-3">
                  {currentService.useCases.map((useCase, index) => (
                    <div key={index} className="flex items-start">
                      <Users className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Preview Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Live Template Preview</h2>
            <p className="text-lg text-gray-600">
              See our professional templates in action - try them now!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Receipt className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Invoice Generator</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Professional invoices with automatic VAT calculations and multi-currency support.
              </p>
              <button 
                onClick={() => handleCtaClick('/store?category=invoice')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Invoice Template
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Calculator className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Payslip Generator</h3>
              </div>
              <p className="text-gray-600 mb-4">
                HMRC-compliant payslips with automatic tax and National Insurance calculations.
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => handleCtaClick('/store')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  🇿🇦 South African Payslip
                </button>
                <button 
                  onClick={() => handleCtaClick('/store')}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  🇬🇧 UK Payslip
                </button>
                <button 
                  onClick={() => handleCtaClick('/store')}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                >
                  📋 Standard Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SORMALITICS?</h2>
            <p className="text-lg text-gray-600">
              Professional-grade features that set us apart from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex flex-wrap items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Streamline Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust SORMALITICS for their business operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
        
            <button 
              onClick={() => handleCtaClick(`${APP_URL}/auth/register`)}
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold rounded-lg text-lg transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SORMALITICSServices;