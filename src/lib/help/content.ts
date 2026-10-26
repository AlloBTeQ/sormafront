export type Category = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

export type FAQ = {
  question: string;
  answer: string;
  categorySlug: string;
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  categorySlug: string;
  tags: string[];
};

export const categories: Category[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Create your account, configure your organisation, and generate your first document in minutes.',
    icon: '🚀',
  },
  {
    slug: 'payroll',
    title: 'Payroll & Tax',
    description: 'Run payroll across 7 jurisdictions with automatic PAYE, UIF, NIC, and Social Security calculations.',
    icon: '💰',
  },
  {
    slug: 'invoicing',
    title: 'Invoicing',
    description: 'Create VAT invoices with multi-currency support and automatic VAT calculations.',
    icon: '📄',
  },
  {
    slug: 'tax-compliance',
    title: 'Tax Compliance',
    description: 'Generate statutory forms — EMP201, P32, P60, Form 941, P9A — and stay ahead of every deadline.',
    icon: '🏛️',
  },
  {
    slug: 'billing-plans',
    title: 'Billing & Plans',
    description: 'Compare plans, manage your subscription, and understand your monthly document allowances.',
    icon: '💳',
  },
  {
    slug: 'security-data',
    title: 'Security & Data',
    description: 'Encryption, access controls, data exports, and how we keep your financial data safe.',
    icon: '🔐',
  },
];

export const faqs: FAQ[] = [
  // Getting Started
  {
    question: 'How do I create a SORMALITICS account?',
    answer:
      'Visit sormalitics.com and click "Get started". Enter your email address and choose a strong password. You will receive a verification email — click the link inside to activate your account. No credit card is required to join the Free plan.',
    categorySlug: 'getting-started',
  },
  {
    question: 'Do I need a credit card to get started?',
    answer:
      'No. The Free plan needs no credit card. It lets your business try SORMALITICS on real documents — 3 invoices, 2 quotations, 1 payslip and 1 agreement. That allowance is once-off, not monthly, and it belongs to your company: accounts that share a registration, tax or VAT number share it. A card is only needed when you upgrade to Professional or Business.',
    categorySlug: 'getting-started',
  },
  {
    question: 'Can I use SORMALITICS on a phone or tablet?',
    answer:
      'Yes. SORMALITICS is fully responsive and works in any modern browser including Safari on iOS and Chrome on Android. PDF generation and email delivery work identically across all devices.',
    categorySlug: 'getting-started',
  },

  // Payroll
  {
    question: 'Which countries does SORMALITICS support for payroll?',
    answer:
      'SORMALITICS supports payroll in 7 jurisdictions: South Africa (SARS), United Kingdom (HMRC), United States (IRS), Kenya (KRA), Uganda (URA), Botswana (BURS), and Zambia (ZRA). Each region has a dedicated tax engine with verified 2024/25 statutory rates.',
    categorySlug: 'payroll',
  },
  {
    question: 'How accurate are the tax calculations?',
    answer:
      "Our tax engines use the latest published statutory rates from each authority. For South Africa this includes the 2024/25 PAYE tables, UIF (1%), and SDL (1%). Engines are reviewed annually when new rates are published. We recommend confirming generated figures with a qualified accountant before submission.",
    categorySlug: 'payroll',
  },
  {
    question: 'Can I import employees from a spreadsheet?',
    answer:
      'Yes. Navigate to Payroll → Employees → Import and upload a CSV following the provided template. The importer accepts employee name, ID number, region, basic salary, and bank details. Validation errors are shown inline before any records are saved.',
    categorySlug: 'payroll',
  },

  // Invoicing
  {
    question: 'What currencies does SORMALITICS support for invoices?',
    answer:
      "SORMALITICS supports ZAR, GBP, USD, KES, UGX, BWP, ZMW, EUR, NGN, GHS, CAD, AUD, and INR. The currency and VAT rate default to your organisation's country but can be overridden per invoice.",
    categorySlug: 'invoicing',
  },
  {
    question: 'How do I add VAT to my invoices?',
    answer:
      "When creating an invoice, select your jurisdiction under \"Tax Settings\". SORMALITICS applies the correct VAT rate automatically — 15% for South Africa, 20% for the UK, 16% for Kenya. You can also enter a custom rate or mark the invoice as VAT-exempt.",
    categorySlug: 'invoicing',
  },
  {
    question: 'Can my clients pay invoices online?',
    answer:
      'Direct online payment links are on the Enterprise roadmap. Currently clients receive a professional PDF invoice by email and pay via your stated bank or payment details. You can mark invoices as paid manually in your document history.',
    categorySlug: 'invoicing',
  },

  // Tax Compliance
  {
    question: 'What is an EMP201 and when do I need to submit it?',
    answer:
      'The EMP201 is a South African monthly employer declaration submitted to SARS. It declares the PAYE, UIF, and SDL withheld and owed for the month. It must be filed and paid by the 7th of the following month. SORMALITICS generates an EMP201 schedule from your approved payroll run, for you to check and submit on eFiling.',
    categorySlug: 'tax-compliance',
  },
  {
    question: 'How does SORMALITICS handle PAYE across multiple tax brackets?',
    answer:
      "Each tax engine applies progressive rates to the employee's annualised income, then divides the annual liability by the number of pay periods. For South Africa, the 2024/25 brackets run from 18% to 45%. UIF and SDL are flat percentages capped at statutory thresholds.",
    categorySlug: 'tax-compliance',
  },
  {
    question: 'Can I generate P60s for all my UK employees at once?',
    answer:
      'Yes. In the Tax Compliance Hub, go to UK → P60 and select the tax year. SORMALITICS generates individual P60 certificates for every active employee across your approved runs for that year. Download a ZIP archive or email each P60 directly to the employee.',
    categorySlug: 'tax-compliance',
  },

  // Billing & Plans
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes. Upgrades take effect immediately and are prorated for the remainder of your billing period. Downgrades apply at the start of your next billing cycle — you retain your current plan benefits until then.',
    categorySlug: 'billing-plans',
  },
  {
    question: 'What happens if I exceed my monthly document limit?',
    answer:
      'You will see an in-app prompt to upgrade before generating further documents. Documents you have already generated are not affected. Upgrading from the Billing page resets your limit immediately.',
    categorySlug: 'billing-plans',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes. Annual billing on Professional or Business saves approximately 17% compared to the monthly price. The discount is applied automatically at checkout when you select "Billed annually".',
    categorySlug: 'billing-plans',
  },

  // Security & Data
  {
    question: 'Is my financial data encrypted?',
    answer:
      'Yes. All data is encrypted in transit using TLS 1.3 and encrypted at rest with AES-256 in our MongoDB Atlas cluster. Passwords are hashed with bcrypt. Payment card details are never stored — all payment processing is handled by Stripe.',
    categorySlug: 'security-data',
  },
  {
    question: 'Can I export all my data?',
    answer:
      'Yes. From Settings → Data & Privacy, request a full data export. This includes all documents, employee records, payroll runs, and invoice history in JSON format. The export is prepared within 24 hours and delivered to your registered email.',
    categorySlug: 'security-data',
  },
  {
    question: "How do I remove a team member's access?",
    answer:
      "Go to Settings → Team and click the menu next to the team member's name, then select \"Remove from team\". Access is revoked immediately and any active sessions are invalidated. Their historical actions are preserved in your audit log.",
    categorySlug: 'security-data',
  },
];

export const articles: Article[] = [
  // Getting Started
  {
    slug: 'create-your-account',
    title: 'How to Create Your SORMALITICS Account',
    summary:
      'Step-by-step guide to signing up, verifying your email, and setting up your organisation profile.',
    body: [
      'Creating your SORMALITICS account takes under two minutes. Visit sormalitics.com and click the "Get started" button in the top navigation. Enter your email address and choose a strong password — at least 8 characters with a mix of letters and numbers is recommended.',
      'After submitting the registration form, check your inbox for a verification email from noreply@sormalitics.com. Click the "Verify email" link inside. If the email does not arrive within a few minutes, check your spam folder or use the "Resend verification" link on the login page.',
      'Once verified, you will be prompted to complete your organisation profile. Enter your company name, country of operation, and preferred currency. This information pre-fills your documents and determines which payroll tax engines are available to you.',
      'Your account starts on the Free plan — no credit card required — with 3 invoices, 2 quotations, 1 payslip and 1 agreement to try the product. You can upgrade to Professional or Business from the Billing page at any time to keep going and unlock more features.',
    ],
    categorySlug: 'getting-started',
    tags: ['account', 'registration', 'verification', 'setup', 'onboarding'],
  },
  {
    slug: 'first-payroll-run',
    title: 'Running Your First Payroll',
    summary:
      'Add employees, configure regions and salaries, then process your first payroll run end-to-end.',
    body: [
      "Before running payroll, you need at least one employee record. Navigate to Payroll → Employees → Add employee. Fill in the employee's full name, ID or passport number, region (e.g. ZA for South Africa), department, and basic monthly salary. Repeat for all employees you want to include.",
      'Once your employees are saved, go to Payroll → Runs → New run. Select the pay period, the payroll region, and the pay date. Click "Preview" to see a line-by-line breakdown of gross pay, statutory deductions, and net pay for every employee before committing.',
      'Review the preview carefully. If you need to adjust a salary or add a one-off bonus, click "Edit" next to that employee\'s line — changes recalculate instantly. When satisfied, click "Approve run". The status moves from Draft to Approved and the payroll figures are locked.',
      'From the run detail page you can generate individual payslips as PDFs, email them directly to employees, and export the run as a CSV for your bank payment upload. Your first payroll run is complete.',
    ],
    categorySlug: 'getting-started',
    tags: ['payroll', 'first run', 'employees', 'setup', 'tutorial'],
  },

  // Payroll
  {
    slug: 'multi-region-tax-calculations',
    title: 'Understanding Multi-Region Tax Calculations',
    summary:
      "How SORMALITICS's dedicated tax engines handle PAYE, NICs, Social Security, and statutory deductions across 7 jurisdictions.",
    body: [
      'SORMALITICS runs a separate tax engine for each of the 7 supported jurisdictions. Each engine is maintained with the current tax year\'s statutory rates and thresholds, sourced directly from the relevant authority — SARS, HMRC, IRS, KRA, URA, BURS, and ZRA.',
      'For South Africa, the engine applies the progressive PAYE tables to the annualised income, calculates monthly UIF (1% employee + 1% employer, capped at the statutory threshold), and SDL (1% employer levy on gross payroll). The primary rebate of R17,235 (2024/25) reduces the annual tax before the monthly figure is derived.',
      'For the United Kingdom, the engine applies Income Tax bands (20%, 40%, 45%) above the personal allowance of £12,570. National Insurance is calculated at 8% (employee) above the Primary Threshold and 15% (employer) above the Secondary Threshold, which fell to £5,000 a year from April 2025. Scottish taxpayers (an S tax code) are charged Scotland’s own six bands instead. Student loan deductions (Plan 1, 2, 4 or 5, and postgraduate loans) are applied if flagged on the employee record.',
      'All engines output a consistent structure: gross pay, itemised deductions, employer contributions, and net pay. You can run a mixed-jurisdiction payroll — UK and South African employees in the same month — and SORMALITICS handles each correctly, generating the appropriate statutory form per region.',
    ],
    categorySlug: 'payroll',
    tags: ['PAYE', 'tax engine', 'multi-region', 'ZA', 'UK', 'US', 'KE', 'calculations'],
  },
  {
    slug: 'payroll-run-workflow',
    title: 'The Payroll Run Workflow Explained',
    summary:
      'A deep dive into the four statuses of a payroll run — Draft, Review, Approved, and Paid — and what happens at each stage.',
    body: [
      'Every payroll run moves through four statuses: Draft, Review, Approved, and Paid. A run can also be Cancelled at the Draft or Review stage. Understanding this workflow prevents errors and ensures your payslips are accurate before they reach employees.',
      "Draft is the initial state. You configure the period, region, and pay date, and all calculations are performed. You can edit salaries, add one-off payments, or remove employees. Nothing is committed at this stage — it's safe to experiment.",
      'Approved locks the payroll figures. No further edits are possible without cancelling and recreating the run. From Approved you can generate payslips, download a payment CSV, and produce the corresponding statutory form (e.g. EMP201 for South Africa). This lock maintains a tamper-proof audit trail.',
      'Marking a run as Paid records when the bank transfers were made. SORMALITICS does not initiate bank payments — you export the payment file and upload it to your bank. Paid is a record-keeping marker. Your accounting module can optionally import paid runs as journal entries.',
    ],
    categorySlug: 'payroll',
    tags: ['workflow', 'payroll run', 'draft', 'approved', 'paid', 'status'],
  },

  // Invoicing
  {
    slug: 'tax-compliant-invoices-vat',
    title: 'Creating VAT Invoices',
    summary:
      'Configure VAT rates, apply reverse charge for cross-border transactions, and ensure your invoices meet local requirements.',
    body: [
      'A VAT invoice has to carry specific information, and the list differs by jurisdiction. SORMALITICS\'s invoice generator fills in the fields most VAT invoices require based on your country setting — VAT number placement, invoice number sequencing, and the appropriate tax label (VAT, GST, or Sales Tax).',
      'To create a new invoice, go to Invoice → New invoice. Select your client, add line items, and choose the tax jurisdiction from the dropdown. SORMALITICS applies the correct rate — 15% for South Africa, 20% for the UK, 16% for Kenya. For cross-border sales to VAT-registered businesses, tick "Reverse charge" to apply the zero-rate rule.',
      'Each line item can carry its own tax code, useful when your invoice includes both taxable and exempt supplies. The invoice total, VAT subtotal, and amount due are calculated automatically and update in real time as you edit.',
      'Click "Generate PDF" when ready. The PDF is created server-side with your logo, company details, and client information. Download it directly or send it to the client by email using the built-in delivery feature. All sent invoices are logged in document history with timestamps.',
    ],
    categorySlug: 'invoicing',
    tags: ['VAT', 'invoice', 'tax-compliant', 'reverse charge', 'PDF', 'multi-currency'],
  },
  {
    slug: 'sending-invoices-email',
    title: 'Sending Invoices Directly to Clients by Email',
    summary:
      "Use SORMALITICS's built-in email delivery to send professional invoices with a single click — including your logo and a custom message.",
    body: [
      'SORMALITICS can send invoices directly to your clients without leaving the platform. After generating an invoice PDF, click "Send by email" on the document preview. Enter the recipient\'s email address (pre-filled if the client is saved), a subject line, and an optional personal message.',
      'The email is dispatched from invoices@sormalitics.com with your company name as the sender identity. The invoice PDF is attached automatically. Clients receive a professional, branded email — not a generic file-sharing link.',
      'Each sent invoice is logged in your document history with the delivery timestamp and recipient address. If you need to resend or send a payment reminder, click "Resend" from the history view. The PDF can also be downloaded again at any time.',
      'Email delivery is available on the Professional plan and above. Free plan users can download PDFs but not use the built-in email delivery feature. If you are on the Free plan, consider upgrading to avoid the extra step of sending from your personal inbox.',
    ],
    categorySlug: 'invoicing',
    tags: ['email', 'delivery', 'invoice', 'send', 'client', 'PDF', 'Professional'],
  },

  // Tax Compliance
  {
    slug: 'generating-emp201',
    title: 'Generating Your EMP201 for SARS',
    summary:
      'Produce a pre-filled EMP201 monthly PAYE declaration from your approved South African payroll run.',
    body: [
      'The EMP201 is a mandatory monthly return submitted to SARS declaring the PAYE, UIF, and SDL withheld from employees and owed by the employer. It must be filed and paid by the 7th of the month following the payroll period. SORMALITICS generates an EMP201 schedule directly from your approved payroll run.',
      'To generate the EMP201, ensure your payroll run for the relevant month is in Approved status. Navigate to Payroll → Tax Compliance → EMP201, select the period (e.g. May 2025), and click "Generate". SORMALITICS pulls the approved figures and maps them to the correct EMP201 fields automatically.',
      'The generated form shows your employer PAYE reference number, the total PAYE deducted, employer and employee UIF contributions, and the SDL levy. Verify these figures against your payroll summary before submission. If any figure looks incorrect, check the underlying payroll run — you cannot edit the EMP201 directly.',
      'Download the EMP201 as a PDF for your records. You must submit the actual return via SARS eFiling — SORMALITICS does not connect directly to eFiling. The generated PDF serves as a reference to ensure you enter the correct amounts on eFiling. After submission, upload the SARS receipt to your compliance document history.',
    ],
    categorySlug: 'tax-compliance',
    tags: ['EMP201', 'SARS', 'PAYE', 'South Africa', 'monthly return', 'UIF', 'SDL'],
  },
  {
    slug: 'paye-filing-deadlines',
    title: 'PAYE Filing Deadlines by Region',
    summary:
      'A reference guide to statutory filing dates for PAYE and employer returns across all 7 SORMALITICS-supported jurisdictions.',
    body: [
      'Missing a PAYE filing deadline results in statutory penalties and interest from the tax authority. SORMALITICS shows a compliance calendar on your Tax Compliance Hub dashboard, but understanding the underlying deadlines helps you plan payroll processing well in advance.',
      'South Africa (SARS): EMP201 must be filed and paid by the 7th of the following month. The bi-annual EMP501 reconciliation is due 31 October and 31 May. IRP5 certificates must be issued to employees by the same dates. United Kingdom (HMRC): The P32 employer payment record must be filed and paid by the 19th of the following month (22nd for electronic payment). P35 annual employer return is due 19 April. P60 certificates must reach employees by 31 May.',
      'United States (IRS): Form 941 (quarterly federal tax return) is due the last day of the month following each quarter — April 30, July 31, October 31, and January 31. FUTA (Form 940) is filed annually by January 31. Kenya (KRA): Monthly PAYE returns are due by the 9th of the following month. The annual P9A certificate is due by end of February.',
      "Uganda (URA): Monthly PAYE returns are due by the 15th of the following month. Botswana (BURS): ITW9 monthly returns are due by the end of the following month. Zambia (ZRA): Form P monthly returns are due by the 10th of the following month. SORMALITICS's compliance calendar highlights all upcoming deadlines based on your active payroll regions.",
    ],
    categorySlug: 'tax-compliance',
    tags: ['deadlines', 'PAYE', 'EMP201', 'P32', 'Form 941', 'KRA', 'filing dates', 'compliance'],
  },

  // Billing & Plans
  {
    slug: 'comparing-plans',
    title: 'Comparing Free, Professional, and Business Plans',
    summary:
      'A side-by-side breakdown of what each SORMALITICS plan includes — documents, regions, team seats, and features.',
    body: [
      'SORMALITICS offers four plans: Free, Professional, Business and Practitioner. The right one depends on how many people will use it, whether you run payroll, and whether you look after clients as a practice.',
      'Free is for trying the platform on your own. Professional is for a single business with up to three users. Business adds teams — Finance, Payroll and Exco each see their own work, with segregation of duties between preparing and approving. Practitioner is for accounting practices and is billed per client.',
      'Limits, features and prices change as the product grows, so the Pricing page is always the current reference for what each plan includes.',
    ],
    categorySlug: 'billing-plans',
    tags: ['plans', 'Free', 'Professional', 'Business', 'Enterprise', 'pricing', 'comparison'],
  },
  {
    slug: 'upgrading-your-subscription',
    title: 'How to Upgrade Your Subscription',
    summary:
      'Upgrade from Free to Professional or Business in a few clicks — your new limits take effect immediately.',
    body: [
      'You can upgrade your SORMALITICS subscription at any time from the Billing page. In the dashboard navigate to Settings → Billing & Plans. You will see your current plan and usage for the billing period, along with the available upgrade options.',
      'Click "Upgrade" next to the plan you want. Select monthly or annual billing — annual billing saves approximately 17%. Review the order summary, which shows the prorated charge for the remainder of your current billing month, then enter your card details on the Stripe-secured checkout page.',
      'Your upgrade takes effect immediately upon payment confirmation. Your document limit and feature access update within seconds. There is no need to log out or refresh the page — SORMALITICS re-validates your plan on the next request automatically.',
      'If you ever need to downgrade, you can do so from the same Billing page. Downgrades apply at the start of your next billing cycle. To cancel entirely, click "Cancel plan" — your access continues until the end of your paid period with no refunds for unused time.',
    ],
    categorySlug: 'billing-plans',
    tags: ['upgrade', 'subscription', 'billing', 'payment', 'Stripe', 'plan change'],
  },

  // Security & Data
  {
    slug: 'how-we-protect-your-data',
    title: 'How SORMALITICS Protects Your Financial Data',
    summary:
      'Encryption at rest and in transit, authentication security, and infrastructure safeguards that keep your data safe.',
    body: [
      'Financial data requires a higher standard of security than most web applications. SORMALITICS applies multiple layers of protection to ensure your payroll figures, employee records, and invoice data remain confidential and tamper-proof.',
      'All data transmitted between your browser and our servers is encrypted using TLS 1.3. At rest, your data is stored in MongoDB Atlas with AES-256 encryption. Backups are taken nightly and stored in geographically separate regions with the same encryption standard.',
      'Authentication uses JWT tokens stored in HttpOnly, Secure, SameSite=Strict cookies — not localStorage. This means your session token cannot be accessed by JavaScript running on the page, preventing cross-site scripting (XSS) attacks from stealing credentials. Sessions expire after 7 days of inactivity.',
      'We do not store raw payment card numbers. All payment processing is handled by Stripe, which is PCI DSS Level 1 certified. SORMALITICS stores only your Stripe customer ID and subscription metadata. Employee bank account numbers (used for payment file exports) are stored encrypted and only decrypted during export generation.',
    ],
    categorySlug: 'security-data',
    tags: ['encryption', 'TLS', 'AES-256', 'security', 'JWT', 'Stripe', 'privacy'],
  },
  {
    slug: 'team-member-permissions',
    title: 'Managing Team Member Permissions',
    summary:
      'Invite team members, assign roles, restrict module access, and revoke permissions on Business and Enterprise plans.',
    body: [
      'On Business and Enterprise plans you can invite team members to your SORMALITICS organisation. Navigate to Settings → Team → Invite member, enter their email address, select a role, and click Send invitation. They will receive an invitation email with a secure accept link.',
      'SORMALITICS has three built-in roles. Admin can access all modules, manage billing, invite and remove team members, and view all documents. Manager can run payroll, create invoices, and view reports but cannot access billing or team management. Viewer has read-only access — useful for accountants who need to review figures without making changes.',
      'To remove a team member, go to Settings → Team, click the menu next to their name, and select "Remove". Access is revoked immediately and any active sessions they hold are invalidated within minutes. Historical actions they performed are preserved in your audit log for compliance purposes.',
      'Granular per-module permissions (e.g. a member who can only access invoicing but not payroll) are available on the Enterprise plan via custom permission sets. Contact support to configure custom roles for your team.',
    ],
    categorySlug: 'security-data',
    tags: ['team', 'permissions', 'roles', 'admin', 'manager', 'access control', 'Business'],
  },
];
