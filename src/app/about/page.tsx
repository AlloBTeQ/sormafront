'use client'
import { APP_URL } from '@/lib/site';
import { codeList } from '@/lib/payroll/jurisdictionStatus';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Shield, UserCheck, Globe, TrendingUp, Users, Zap, 
  Receipt, Calculator, PenTool, Briefcase, DollarSign, Clock,
  FileText, CreditCard, Smartphone, Star, CheckCircle, Building,
  Award, Scale, Lock, Server, Eye, Target, Gavel, BookOpen,
  Leaf, Brush, Music, Car, Home, ArrowRight, Send
} from 'lucide-react';
import { SormaliticsMark } from '@/components/brand/SormaliticsMark';
import { ALL_PRODUCTS, formatPrice } from '@/lib/store/product-catalog';

const cheapestDocument = {
  ZAR: Math.min(...ALL_PRODUCTS.map((p) => p.price.ZAR)),
  GBP: Math.min(...ALL_PRODUCTS.map((p) => p.price.GBP)),
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'layout']);
const motion = {
  div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
    <div {...Object.fromEntries(Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k)))}>{children}</div>
  ),
};

interface PlatformStats {
  practitioners: number;
  documentsGenerated: number;
  countriesSupported: number;
  freelancers: number;
  loading: boolean;
  error: boolean;
}

const SORMALITICSAbout = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    practitioners: 0,
    documentsGenerated: 0,
    countriesSupported: 7,
    freelancers: 0,
    loading: true,
    error: false
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const fetchPublicStats = async () => {
    try {
      const response = await fetch(`${APP_URL}/api/public/platform-stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      
      setStats({
        practitioners: data.practitioners ?? 0,
        documentsGenerated: data.documentsGenerated ?? 0,
        countriesSupported: 7,
        freelancers: data.freelancers ?? 0,
        loading: false,
        error: false
      });
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      
      setStats({
        practitioners: 0,
        documentsGenerated: 0,
        countriesSupported: 7,
        freelancers: 0,
        loading: false,
        error: true
      });
    }
  };
  
  useEffect(() => {
    setIsLoaded(true);
    setStats(st => ({ ...st, loading: false }));
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen flex flex-wrap items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            {...fadeInUp}
            className="text-center"
          >
            <div className="flex flex-wrap items-center justify-center mb-8">
              <SormaliticsMark className="h-16 w-16 sm:h-24 sm:w-24 mr-4" />
              <div>
                <span className="text-3xl sm:text-5xl font-bold text-ink-700">SORMALITICS</span>
                <div className="text-sm text-aurum-600 mt-1">Summa de Arithmetica</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Focus on Quality Services,
              <span className="block text-blue-600 mt-2">Not Admin Headaches</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              SORMALITICS helps <strong>practitioners, accountants, consultants, and freelancers</strong> eliminate 
              admin stress and tax compliance headaches so they can focus on delivering quality services to their clients.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span>No Monthly Subscriptions</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span>Cut Your Admin Time</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                <Globe className="h-4 w-4 mr-2 text-purple-600" />
                <span>Built for UK & SA payroll</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store?category=invoice">
              <button className="px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 font-semibold rounded-lg text-lg transition-colors">
                Browse Invoice Templates
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </button>
              </Link>
              <Link href="/store">
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg text-lg transition-colors">
                See Payslip Tool
              </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem We Solve</h2>
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                <strong>You're brilliant at what you do</strong> - whether that's accounting, consulting, 
                freelance design, or running a professional practice. But you're spending too much time 
                on administrative tasks instead of serving clients.
              </p>
              
              <p>
                Professional financial tools like enterprise software cost hundreds per month. 
                Basic DIY solutions make you look unprofessional. You're stuck between 
                <strong> expensive complexity and amateur simplicity</strong>.
              </p>
              
              <p>
                Meanwhile, tax compliance requirements keep changing, payroll calculations get more complex, 
                and clients expect professional invoices and contracts. <strong>The admin burden 
                is stealing time from your core business</strong>.
              </p>

            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Solution</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Professional Invoicing</h4>
                  <p className="text-gray-600 text-sm">Professional invoices with the VAT details laid out for you</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Smart Payroll</h4>
                  <p className="text-gray-600 text-sm">UK and South African payslips with tax calculated for you to review</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <PenTool className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Legal Agreements</h4>
                  <p className="text-gray-600 text-sm">Professional contracts with e-signature, no expensive subscriptions</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(cheapestDocument.ZAR, 'ZAR')} <span className="text-base font-medium text-green-700">/ {formatPrice(cheapestDocument.GBP, 'GBP')}</span>
                  </div>
                  <div className="text-green-700 font-medium">Pay per document, from</div>
                  <div className="text-green-600 text-sm">
                    No subscription needed — or <Link href="/pricing" className="underline">choose a plan</Link> when the volume justifies it.{' '}
                    <Link href="/store" className="underline">See store pricing</Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Help Focus on Quality</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional service providers who deserve professional tools without professional price tags
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Scale,
                title: "Accountants",
                description: "Multi-client payroll, HMRC reporting support, tax calculations",
                needs: ["Client invoicing", "Payroll processing", "Tax compliance", "Professional image"]
              },
              {
                icon: Briefcase,
                title: "Consultants",
                description: "Professional invoicing, contracts, client management",
                needs: ["Project invoicing", "Service agreements", "Time savings"]
              },
              {
                icon: Users,
                title: "Freelancers",
                description: "Professional documents that make you look established",
                needs: ["Client invoicing", "Tax compliance", "Professional contracts", "Affordable tools"]
              },
              {
                icon: Building,
                title: "Practitioners",
                description: "Legal, medical, and professional service providers",
                needs: ["Client billing", "Staff payroll", "Service agreements", "Compliance tracking"]
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex flex-wrap items-center justify-center mx-auto mb-4">
                      <service.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">{service.description}</p>
                    <div className="space-y-2">
                      {service.needs.map((need, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700 justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>{need}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Making a Real Difference</h2>
            <p className="text-lg text-gray-600">
              Helping professionals reclaim their time and focus on what matters
            </p>
          </div>

        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Professionals Choose SORMALITICS</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We understand the challenges of running a professional practice because we've been there too
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  icon: <DollarSign className="h-6 w-6 text-green-500" />,
                  title: "No Monthly Subscriptions",
                  description: "Pay only when you use it. Perfect for practices with seasonal or irregular income."
                },
                {
                  icon: <Zap className="h-6 w-6 text-yellow-500" />,
                  title: "Professional Results Instantly", 
                  description: "Generate documents in minutes that make you look established, even when you're just starting."
                },
                {
                  icon: <Shield className="h-6 w-6 text-blue-500" />,
                  title: "Tax Rules You Can See",
                  description: "UK and SA rates and thresholds are applied for you and shown on every calculation, so you or your accountant can check them."
                },
                {
                  icon: <Clock className="h-6 w-6 text-purple-500" />,
                  title: "Get Your Admin Hours Back",
                  description: "Automate repetitive admin tasks and focus on what you do best - serving clients."
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-gray-100 p-3 rounded-full flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Focus on Quality Work?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Join the professionals who have eliminated admin stress with SORMALITICS. 
                Start with pay-per-use and see the difference professional tools make.
              </p>
              <div className="space-y-4">
                <Link href="/store?category=invoice" className="block w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center">
                  Browse Invoice Templates
                </Link>
                <Link href="/store" className="block w-full border-2 border-white text-white py-3 px-6 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center">
                  Generate a Payslip
                </Link>
              </div>
              <p className="text-center text-blue-200 text-sm mt-4">
                ✨ No setup required • Pay per document • Professional results instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 via-green-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Stop Wrestling With Admin.
              <span className="block mt-2">Start Focusing on Quality.</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join the professionals who've eliminated admin stress with SORMALITICS. 
              Preview any document before you pay and see the difference professional documents make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store?category=invoice" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg">
                Browse Invoice Templates
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Link>
              <Link href="/store" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Generate a Payslip
              </Link>
            </div>
            <p className="text-center text-blue-200 text-sm mt-6">
              ✨ Pay only when you use • No setup required • Professional results in minutes
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            <strong>SORMALITICS</strong> - Professional financial tools for practitioners, accountants, consultants & freelancers
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Payroll live in {codeList('live')} · invoicing, accounting and agreements
          </p>
        </div>
      </div>
    </div>
  );
};

export default SORMALITICSAbout;