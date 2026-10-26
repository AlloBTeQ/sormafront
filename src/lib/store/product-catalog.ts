import { APP_URL } from '@/lib/site';

export type ProductCategory = 'payslip' | 'invoice' | 'agreement' | 'schedule';
export type Currency = 'GBP' | 'USD' | 'EUR' | 'ZAR';
export type Jurisdiction = 'UK' | 'RSA' | 'USA' | 'EU' | 'STANDARD';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  jurisdiction: Jurisdiction;
  description: string;
  features: string[];
  complexity: 'simple' | 'standard' | 'complex';
  price: Record<Currency, number>;
  previewImage: string;
  templatePath: string;
  editableFields: string[];
  requiredFields: string[];
  tags: string[];
}

export const PAYSLIP_PRODUCTS: Product[] = [
  {
    id: 'payslip-rsa',
    name: 'RSA Payslip',
    category: 'payslip',
    jurisdiction: 'RSA',
    description: 'South African payslip with PAYE, UIF and other deductions calculated for you to review',
    features: [
      'SARS PAYE calculations',
      'UIF deductions (1%)',
      'SDL calculations',
      'Provident/Pension fund',
      'Medical aid deductions',
      'Nett pay calculation',
      'YTD tracking',
      'IRP5 ready'
    ],
    complexity: 'complex',
    price: {
      GBP: 2.49,
      USD: 3.29,
      EUR: 2.99,
      ZAR: 49.99
    },
    previewImage: '/templates/previews/payslip-rsa.png',
    templatePath: '',
    editableFields: [
      'employeeName', 'employeeId', 'idNumber', 'taxNumber',
      'payPeriod', 'payDate', 'basicSalary', 'allowances',
      'overtime', 'bonus', 'deductions', 'medicalAid',
      'pensionFund', 'bankDetails'
    ],
    requiredFields: ['employeeName', 'basicSalary', 'payPeriod'],
    tags: ['south-africa', 'sars', 'paye', 'uif', 'compliance']
  },
  {
    id: 'payslip-uk',
    name: 'UK Payslip',
    category: 'payslip',
    jurisdiction: 'UK',
    description: 'UK payslip with PAYE, NI and pension calculated for you to review',
    features: [
      'HMRC PAYE calculations',
      'National Insurance (Class 1)',
      'Student loan deductions',
      'Pension auto-enrollment',
      'Tax code processing',
      'Gross/Net pay',
      'YTD tracking',
      'P60 ready'
    ],
    complexity: 'complex',
    price: {
      GBP: 1.99,
      USD: 2.49,
      EUR: 2.29,
      ZAR: 39
    },
    previewImage: '/templates/previews/payslip-uk.png',
    templatePath: '',
    editableFields: [
      'employeeName', 'employeeId', 'niNumber', 'taxCode',
      'payPeriod', 'payDate', 'basicHours', 'hourlyRate',
      'overtime', 'bonus', 'studentLoan', 'pensionRate',
      'bankDetails'
    ],
    requiredFields: ['employeeName', 'basicHours', 'hourlyRate'],
    tags: ['uk', 'hmrc', 'paye', 'national-insurance', 'compliance']
  },
  {
    id: 'payslip-standard',
    name: 'Standard Payslip',
    category: 'payslip',
    jurisdiction: 'STANDARD',
    description: 'Universal payslip template - no automatic calculations. You input all values manually for any country.',
    features: [
      'Clean professional layout',
      'Manual entry for all fields',
      'Customizable deductions',
      'Add your own tax lines',
      'Multi-currency support',
      'No jurisdiction restrictions',
      'PDF download',
      'Email delivery'
    ],
    complexity: 'simple',
    price: {
      GBP: 1.49,
      USD: 1.99,
      EUR: 1.79,
      ZAR: 29
    },
    previewImage: '/templates/previews/payslip-standard.png',
    templatePath: '',
    editableFields: [
      'employeeName', 'employeeId', 'employeeNumber',
      'payPeriod', 'payDate', 'earnings', 'deductions',
      'grossPay', 'netPay', 'ytdGross', 'ytdDeductions'
    ],
    requiredFields: ['employeeName', 'grossPay'],
    tags: ['universal', 'manual', 'flexible', 'any-country']
  }
];

export const INVOICE_PRODUCTS: Product[] = [
  {
    id: 'invoice-uk-vat',
    name: 'UK Invoice (VAT)',
    category: 'invoice',
    jurisdiction: 'UK',
    description: 'UK VAT invoice with VAT calculated at 20%',
    features: [
      'Automatic 20% VAT calculation',
      'VAT registration number field',
      'UK VAT-invoice fields included',
      'Multiple line items',
      'Subtotal + VAT breakdown',
      'Payment terms',
      'Bank details section',
      'Professional design'
    ],
    complexity: 'standard',
    price: {
      GBP: 2.99,
      USD: 3.99,
      EUR: 3.49,
      ZAR: 59
    },
    previewImage: '/templates/previews/invoice-uk-vat.png',
    templatePath: '',
    editableFields: [
      'invoiceNumber', 'invoiceDate', 'dueDate', 'clientName',
      'clientAddress', 'clientEmail', 'vatNumber', 'items',
      'notes', 'paymentTerms', 'bankDetails'
    ],
    requiredFields: ['invoiceNumber', 'clientName', 'invoiceDate'],
    tags: ['uk', 'vat', 'hmrc', '20%', 'business']
  },
  {
    id: 'invoice-rsa-vat',
    name: 'RSA Invoice (VAT)',
    category: 'invoice',
    jurisdiction: 'RSA',
    description: 'South African tax invoice with VAT calculated at 15%',
    features: [
      'Automatic 15% VAT calculation',
      'VAT registration number',
      'SARS tax-invoice fields included',
      'Multiple line items',
      'Subtotal + VAT breakdown',
      'Tax invoice declaration',
      'Banking details',
      'ZAR currency formatting'
    ],
    complexity: 'standard',
    price: {
      GBP: 2.99,
      USD: 3.99,
      EUR: 3.49,
      ZAR: 49
    },
    previewImage: '/templates/previews/invoice-rsa-vat.png',
    templatePath: '',
    editableFields: [
      'invoiceNumber', 'invoiceDate', 'dueDate', 'clientName',
      'clientAddress', 'clientEmail', 'vatNumber', 'items',
      'notes', 'paymentTerms', 'bankDetails'
    ],
    requiredFields: ['invoiceNumber', 'clientName', 'invoiceDate'],
    tags: ['south-africa', 'vat', 'sars', '15%', 'tax-invoice']
  },
  {
    id: 'invoice-usa',
    name: 'USA Invoice',
    category: 'invoice',
    jurisdiction: 'USA',
    description: 'US format invoice with state sales tax support',
    features: [
      'State sales tax calculation',
      'Federal tax ID field',
      'Multiple tax rates support',
      'Professional US format',
      'Line item details',
      'Discount support',
      'Payment methods',
      'USD currency'
    ],
    complexity: 'standard',
    price: {
      GBP: 2.99,
      USD: 3.99,
      EUR: 3.49,
      ZAR: 59
    },
    previewImage: '/templates/previews/invoice-usa.png',
    templatePath: '',
    editableFields: [
      'invoiceNumber', 'invoiceDate', 'dueDate', 'clientName',
      'clientAddress', 'clientEmail', 'taxId', 'items',
      'salesTaxRate', 'notes', 'paymentTerms'
    ],
    requiredFields: ['invoiceNumber', 'clientName', 'invoiceDate'],
    tags: ['usa', 'sales-tax', 'federal', 'state-tax']
  },
  {
    id: 'invoice-eu-vat',
    name: 'EU Invoice (VAT)',
    category: 'invoice',
    jurisdiction: 'EU',
    description: 'EU invoice with configurable VAT rates for different countries',
    features: [
      'Configurable VAT rates',
      'VAT ID validation',
      'Reverse charge support',
      'Multi-country support',
      'Intra-community supply',
      'Currency selection (EUR)',
      'Fields for EU VAT invoices',
      'Professional format'
    ],
    complexity: 'standard',
    price: {
      GBP: 2.99,
      USD: 3.99,
      EUR: 3.49,
      ZAR: 59
    },
    previewImage: '/templates/previews/invoice-eu-vat.png',
    templatePath: '',
    editableFields: [
      'invoiceNumber', 'invoiceDate', 'dueDate', 'clientName',
      'clientAddress', 'clientEmail', 'vatId', 'vatRate',
      'reverseCharge', 'items', 'notes', 'paymentTerms'
    ],
    requiredFields: ['invoiceNumber', 'clientName', 'invoiceDate'],
    tags: ['eu', 'vat', 'europe', 'intra-community', 'reverse-charge']
  },
  {
    id: 'invoice-standard',
    name: 'Standard Invoice',
    category: 'invoice',
    jurisdiction: 'STANDARD',
    description: 'Universal invoice template - works for any country, manual tax entry',
    features: [
      'No automatic tax calculations',
      'Add your own tax lines',
      'Multi-currency support',
      'Flexible format',
      'Line item support',
      'Notes and terms',
      'Professional design',
      'Works worldwide'
    ],
    complexity: 'simple',
    price: {
      GBP: 1.99,
      USD: 2.49,
      EUR: 2.29,
      ZAR: 39
    },
    previewImage: '/templates/previews/invoice-standard.png',
    templatePath: '',
    editableFields: [
      'invoiceNumber', 'invoiceDate', 'dueDate', 'clientName',
      'clientAddress', 'items', 'tax', 'total', 'notes'
    ],
    requiredFields: ['invoiceNumber', 'clientName'],
    tags: ['universal', 'manual', 'flexible', 'any-country']
  }
];

export const AGREEMENT_PRODUCTS: Product[] = [
  {
    id: 'agreement-nda-simple',
    name: 'NDA - Simple',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Basic non-disclosure agreement for simple business relationships',
    features: [
      '2-party NDA',
      'Mutual or one-way',
      'Standard confidentiality clauses',
      'Time period specification',
      'E-signature ready',
      'PDF + Word format',
      'Lawyer reviewed',
      '3-page document'
    ],
    complexity: 'simple',
    price: {
      GBP: 4.99,
      USD: 6.49,
      EUR: 5.79,
      ZAR: 99
    },
    previewImage: '/templates/previews/nda-simple.png',
    templatePath: '',
    editableFields: [
      'party1Name', 'party1Address', 'party2Name', 'party2Address',
      'effectiveDate', 'term', 'ndaType', 'governingLaw'
    ],
    requiredFields: ['party1Name', 'party2Name', 'effectiveDate'],
    tags: ['nda', 'confidentiality', 'simple', 'standard']
  },
  {
    id: 'agreement-nda-complex',
    name: 'NDA - Comprehensive',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Detailed non-disclosure agreement for complex business deals with multiple parties',
    features: [
      'Multi-party support',
      'Detailed definitions',
      'Return/destruction clauses',
      'Indemnification',
      'Jurisdiction specification',
      'Dispute resolution',
      'E-signature ready',
      '8-page comprehensive document'
    ],
    complexity: 'complex',
    price: {
      GBP: 9.99,
      USD: 12.99,
      EUR: 11.49,
      ZAR: 189
    },
    previewImage: '/templates/previews/nda-complex.png',
    templatePath: '',
    editableFields: [
      'parties', 'effectiveDate', 'term', 'confidentialInfo',
      'exceptions', 'returnPolicy', 'remedies', 'governingLaw',
      'jurisdiction', 'disputeResolution'
    ],
    requiredFields: ['parties', 'effectiveDate'],
    tags: ['nda', 'confidentiality', 'complex', 'multi-party', 'comprehensive']
  },
  {
    id: 'agreement-employment-uk',
    name: 'Employment Contract - UK',
    category: 'agreement',
    jurisdiction: 'UK',
    description: 'UK employment contract drafted with ACAS guidance in mind',
    features: [
      'Drafted with ACAS guidance in mind',
      'Terms and conditions',
      'Notice periods',
      'Holiday entitlement',
      'Probation clauses',
      'Pension auto-enrollment',
      'E-signature ready',
      'Written for UK employment'
    ],
    complexity: 'complex',
    price: {
      GBP: 7.99,
      USD: 9.99,
      EUR: 8.99,
      ZAR: 159
    },
    previewImage: '/templates/previews/employment-uk.png',
    templatePath: '',
    editableFields: [
      'employeeName', 'employerName', 'jobTitle', 'startDate',
      'salary', 'hours', 'holidayEntitlement', 'noticePeriod',
      'probationPeriod', 'workLocation', 'pension'
    ],
    requiredFields: ['employeeName', 'employerName', 'jobTitle', 'startDate'],
    tags: ['employment', 'uk', 'acas', 'contract', 'job-offer']
  },
  {
    id: 'agreement-engagement',
    name: 'Engagement Letter',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Professional engagement letter for consultants, accountants, or service providers',
    features: [
      'Scope of services',
      'Fee structure',
      'Client and provider details',
      'Confidentiality clause',
      'Limitation of liability',
      'Termination terms',
      'E-signature ready',
      'Customizable template'
    ],
    complexity: 'standard',
    price: {
      GBP: 5.99,
      USD: 7.99,
      EUR: 6.99,
      ZAR: 119
    },
    previewImage: '/templates/previews/engagement-letter.png',
    templatePath: '',
    editableFields: [
      'providerName', 'clientName', 'serviceDescription', 'fee',
      'startDate', 'endDate', 'confidentiality', 'terminationTerms'
    ],
    requiredFields: ['providerName', 'clientName', 'serviceDescription'],
    tags: ['engagement', 'letter', 'consultant', 'service', 'agreement']
  },
  {
    id: 'agreement-freelancer',
    name: 'Freelancer Agreement',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Standard independent contractor agreement',
    features: [
      'Scope of work',
      'Payment terms',
      'Intellectual property rights',
      'Confidentiality',
      'Termination clauses',
      'Liability limitations',
      'E-signature ready',
      'Works globally'
    ],
    complexity: 'standard',
    price: {
      GBP: 5.99,
      USD: 7.99,
      EUR: 6.99,
      ZAR: 119
    },
    previewImage: '/templates/previews/freelancer.png',
    templatePath: '',
    editableFields: [
      'freelancerName', 'clientName', 'projectDescription',
      'deliverables', 'fee', 'paymentTerms', 'startDate',
      'duration', 'ipOwnership', 'confidentiality'
    ],
    requiredFields: ['freelancerName', 'clientName', 'projectDescription'],
    tags: ['freelancer', 'contractor', 'independent', 'service-agreement']
  },
  {
    id: 'agreement-sales',
    name: 'Sales Agreement',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Basic sales agreement for goods or services',
    features: [
      'Buyer and seller details',
      'Item/service description',
      'Price and payment terms',
      'Delivery terms',
      'Warranty provisions',
      'Standard clauses',
      'E-signature ready',
      '4-page document'
    ],
    complexity: 'simple',
    price: {
      GBP: 4.99,
      USD: 6.49,
      EUR: 5.79,
      ZAR: 99
    },
    previewImage: '/templates/previews/sales-simple.png',
    templatePath: '',
    editableFields: [
      'sellerName', 'buyerName', 'itemDescription', 'quantity',
      'price', 'paymentTerms', 'deliveryDate', 'warranty'
    ],
    requiredFields: ['sellerName', 'buyerName', 'itemDescription'],
    tags: ['sales', 'purchase', 'goods', 'simple']
  },
  {
    id: 'agreement-partnership',
    name: 'Partnership Agreement',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Comprehensive partnership agreement for business partners',
    features: [
      'Multi-partner support',
      'Equity distribution',
      'Profit/loss sharing',
      'Decision-making rights',
      'Exit provisions',
      'Dispute resolution',
      'Capital contributions',
      '12-page comprehensive'
    ],
    complexity: 'complex',
    price: {
      GBP: 12.99,
      USD: 16.99,
      EUR: 14.99,
      ZAR: 249
    },
    previewImage: '/templates/previews/partnership.png',
    templatePath: '',
    editableFields: [
      'partners', 'businessName', 'businessPurpose', 'capitalContributions',
      'profitSharing', 'decisionMaking', 'duties', 'exitClause',
      'disputeResolution', 'duration'
    ],
    requiredFields: ['partners', 'businessName', 'businessPurpose'],
    tags: ['partnership', 'business', 'equity', 'multi-party', 'complex']
  },
  {
    id: 'agreement-lease',
    name: 'Lease Agreement',
    category: 'agreement',
    jurisdiction: 'STANDARD',
    description: 'Residential or commercial property lease agreement',
    features: [
      'Landlord and tenant details',
      'Property description',
      'Rent amount and terms',
      'Security deposit',
      'Maintenance responsibilities',
      'Termination clauses',
      'E-signature ready',
      '8-page document'
    ],
    complexity: 'standard',
    price: {
      GBP: 6.99,
      USD: 8.99,
      EUR: 7.99,
      ZAR: 139
    },
    previewImage: '/templates/previews/lease.png',
    templatePath: '',
    editableFields: [
      'landlordName', 'tenantName', 'propertyAddress', 'leaseType',
      'startDate', 'term', 'rentAmount', 'depositAmount',
      'paymentDate', 'maintenanceTerms', 'utilities'
    ],
    requiredFields: ['landlordName', 'tenantName', 'propertyAddress', 'rentAmount'],
    tags: ['lease', 'rental', 'property', 'landlord', 'tenant']
  }
];

export const SCHEDULE_PRODUCTS: Product[] = [
  {
    id: 'schedule-vat201-rsa',
    name: 'VAT 201 (RSA)',
    category: 'schedule',
    jurisdiction: 'RSA',
    description: 'Schedule of the figures for your VAT201 return, calculated from your entries',
    features: [
      'Figures arranged in VAT201 field order, for you to capture on eFiling',
      'Input tax calculation',
      'Output tax calculation',
      'Automatic nett VAT',
      'Zero-rated supplies',
      'Exempt supplies',
      'Capital goods adjustments',
      'Period-end reconciliation schedule'
    ],
    complexity: 'complex',
    price: {
      GBP: 3.99,
      USD: 4.99,
      EUR: 4.49,
      ZAR: 69
    },
    previewImage: '/templates/previews/vat201.png',
    templatePath: '',
    editableFields: [
      'vendorNumber', 'period', 'standardRatedSupplies', 'zeroRatedSupplies',
      'exemptSupplies', 'inputTax', 'adjustments', 'refundDue', 'paymentDue'
    ],
    requiredFields: ['vendorNumber', 'period'],
    tags: ['vat', 'sars', 'south-africa', 'tax-return', 'vat201']
  },
  {
    id: 'schedule-emp201-rsa',
    name: 'EMP 201 (RSA)',
    category: 'schedule',
    jurisdiction: 'RSA',
    description: 'Schedule of the figures for your EMP201 monthly employer declaration',
    features: [
      'Figures arranged in EMP201 field order, for you to capture on eFiling',
      'PAYE calculation',
      'SDL calculation',
      'UIF calculation',
      'Total liability',
      'Multi-employee support',
      'Reconciliation schedule',
      'Period tracking'
    ],
    complexity: 'complex',
    price: {
      GBP: 3.99,
      USD: 4.99,
      EUR: 4.49,
      ZAR: 69
    },
    previewImage: '/templates/previews/emp201.png',
    templatePath: '',
    editableFields: [
      'employerNumber', 'period', 'totalPAYE', 'totalSDL',
      'totalUIF', 'totalLiability', 'employeeCount', 'reconciliation'
    ],
    requiredFields: ['employerNumber', 'period'],
    tags: ['payroll', 'sars', 'south-africa', 'paye', 'emp201']
  },
  {
    id: 'schedule-vat-uk',
    name: 'VAT Return (UK)',
    category: 'schedule',
    jurisdiction: 'UK',
    description: 'Schedule of the figures for your UK VAT return (MTD)',
    features: [
      'HMRC MTD compatible',
      'Box-by-box calculation',
      'Input tax deduction',
      'Output tax calculation',
      'Net VAT due',
      'EC sales included',
      'Automatic totals',
      'Quarter-end ready'
    ],
    complexity: 'complex',
    price: {
      GBP: 3.99,
      USD: 4.99,
      EUR: 4.49,
      ZAR: 79
    },
    previewImage: '/templates/previews/vat-uk.png',
    templatePath: '',
    editableFields: [
      'vatNumber', 'period', 'box1', 'box2', 'box3', 'box4',
      'box5', 'box6', 'box7', 'box8', 'box9'
    ],
    requiredFields: ['vatNumber', 'period'],
    tags: ['vat', 'hmrc', 'uk', 'mtd', 'making-tax-digital']
  },
  {
    id: 'schedule-payroll-rsa',
    name: 'Payroll Schedule (RSA)',
    category: 'schedule',
    jurisdiction: 'RSA',
    description: 'Monthly payroll summary schedule for all employees',
    features: [
      'Multi-employee listing',
      'Gross salary totals',
      'PAYE breakdown',
      'UIF breakdown',
      'SDL breakdown',
      'Net pay totals',
      'Employer costs',
      'Bank payment list'
    ],
    complexity: 'standard',
    price: {
      GBP: 2.99,
      USD: 3.99,
      EUR: 3.49,
      ZAR: 59
    },
    previewImage: '/templates/previews/payroll-schedule-rsa.png',
    templatePath: '',
    editableFields: [
      'companyName', 'period', 'employees', 'totalGross',
      'totalPAYE', 'totalUIF', 'totalSDL', 'totalNet', 'bankPayments'
    ],
    requiredFields: ['companyName', 'period'],
    tags: ['payroll', 'schedule', 'south-africa', 'summary']
  },
  {
    id: 'schedule-payroll-uk',
    name: 'Payroll Schedule (UK)',
    category: 'schedule',
    jurisdiction: 'UK',
    description: 'Monthly payroll summary schedule for UK employers',
    features: [
      'Multi-employee listing',
      'Gross pay totals',
      'PAYE breakdown',
      'NI employee breakdown',
      'NI employer breakdown',
      'Student loan deductions',
      'Pension contributions',
      'Net pay totals'
    ],
    complexity: 'standard',
    price: {
      GBP: 2.99,
      USD: 3.99,
      EUR: 3.49,
      ZAR: 59
    },
    previewImage: '/templates/previews/payroll-schedule-uk.png',
    templatePath: '',
    editableFields: [
      'companyName', 'period', 'employees', 'totalGross',
      'totalPAYE', 'totalNIEmployee', 'totalNIEmployer',
      'totalPension', 'totalNet'
    ],
    requiredFields: ['companyName', 'period'],
    tags: ['payroll', 'schedule', 'uk', 'hmrc', 'summary']
  },
  {
    id: 'schedule-rental-za',
    name: 'Rental Income & Expense Schedule (ITR12)',
    category: 'schedule',
    jurisdiction: 'RSA',
    description:
      'Working paper for the local rental income section of your ITR12. Covers one year of assessment and up to three properties, and resolves to a single source code — 4210 for a net profit, 4211 for a net loss.',
    features: [
      'One year of assessment, up to 3 properties',
      'Month-by-month rent schedule',
      'Apportionment for part-let or part-year',
      'Wear-and-tear allowance calculated',
      'Improvements routed to base cost',
      'Community-of-property note',
      'Consolidated 4210 / 4211 result',
      'Multi-page PDF, one page per property'
    ],
    complexity: 'complex',
    price: {
      GBP: 7.99,
      USD: 8.99,
      EUR: 8.49,
      ZAR: 149
    },
    previewImage: '/templates/previews/schedule-rental-za.png',
    templatePath: '',
    editableFields: [
      'fullName', 'idNumber', 'taxNumber', 'yearOfAssessment', 'maritalRegime',
      'properties', 'rent', 'otherIncome', 'expenses', 'excluded', 'assets'
    ],
    requiredFields: ['fullName', 'yearOfAssessment'],
    tags: ['rental', 'property', 'itr12', 'sars', 'south-africa', '4210', '4211', 'landlord', 'schedule']
  }
];

export const ALL_PRODUCTS = [
  ...PAYSLIP_PRODUCTS,
  ...INVOICE_PRODUCTS,
  ...AGREEMENT_PRODUCTS,
  ...SCHEDULE_PRODUCTS
];

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return ALL_PRODUCTS.filter(p => p.category === category);
}

export function getProductsByJurisdiction(jurisdiction: Jurisdiction): Product[] {
  return ALL_PRODUCTS.filter(p => p.jurisdiction === jurisdiction);
}

export function getProductsByComplexity(complexity: 'simple' | 'standard' | 'complex'): Product[] {
  return ALL_PRODUCTS.filter(p => p.complexity === complexity);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return ALL_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.includes(lowerQuery))
  );
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: '\u00a3',
  USD: '$',
  EUR: '\u20ac',
  ZAR: 'R',
};

export function getProductPageRoute(product: Product): string | null {
  return product.templatePath ? `/store${product.templatePath}` : null;
}

export function getProductLink(product: Product, currency: Currency = 'ZAR'): string {
  return (
    getProductPageRoute(product) ??
    `${APP_URL}/store/checkout?product=${encodeURIComponent(product.id)}&currency=${currency}`
  );
}

export function getCheckoutLink(productId: string, currency: Currency = 'ZAR'): string {
  return `${APP_URL}/store/checkout?product=${encodeURIComponent(productId)}&currency=${currency}`;
}

export function formatPrice(amount: number, currency: Currency): string {
  return `${CURRENCY_SYMBOLS[currency]}${amount.toFixed(2)}`;
}

export function getCheapestPrice(
  category: ProductCategory,
  currency: Currency,
): number | null {
  const prices = getProductsByCategory(category).map((p) => p.price[currency]);
  return prices.length ? Math.min(...prices) : null;
}

export function formatFromPrice(
  category: ProductCategory,
  currency: Currency,
): string | null {
  const cheapest = getCheapestPrice(category, currency);
  return cheapest === null ? null : `from ${formatPrice(cheapest, currency)}`;
}
