"use client"

import React from 'react';
import Link from 'next/link';
import {
  Calendar, CheckCircle, RotateCcw, Scale, CreditCard,
  AlertTriangle, Mail, Clock,
} from 'lucide-react';
import { LEGAL_VERSIONS } from '@/lib/legal/versions';
import { ALLOBTEQ, POLOMPA, CONTACT } from '@/lib/legal/entities';

export default function RefundPolicyPage() {
  const lastUpdated = "23 August 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Last updated: {lastUpdated}</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-600" />Version {LEGAL_VERSIONS.refunds}</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-8">
          <h2 className="font-semibold text-green-900 mb-2 flex items-center">
            <RotateCcw className="h-5 w-5 mr-2" /> The short version
          </h2>
          <p className="text-green-800 text-sm">
            If SORMALITICS is not for you, tell us within <strong>14 days of your first subscription payment</strong> and we will refund it in full. No reasons needed. After that, subscriptions are not refundable, but you can cancel at any time and you will not be charged again. Your rights as a consumer under local law sit on top of this and are not affected.
          </p>
        </div>

        <div className="space-y-6">

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> 1. The 14-day goodwill refund
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>We offer a full refund of your <strong>first</strong> subscription payment if you ask within <strong>14 days</strong> of that payment.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Applies to your first payment on a Professional, Business or Practitioner plan</li>
                <li>Applies whether you are a business or a consumer</li>
                <li>No reason required</li>
                <li>Available once per customer</li>
              </ul>
              <p>Email <a href="mailto:support@sormalitics.com" className="text-blue-600 hover:underline">support@sormalitics.com</a> from your account address, or ask through the support portal. We aim to process within 5 business days; your bank may take a few days more to show it.</p>
              <p className="text-gray-500">Your account reverts to the Free plan. You keep your data and can carry on using SORMALITICS within the Free plan limits.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Scale className="h-5 w-5 mr-2 text-blue-600" /> 2. Your rights under consumer law
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Nothing in this policy or in our <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link> removes or reduces a right you have by law. If your statutory right gives you more than this policy does, the statutory right wins.</p>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-900">South Africa</div>
                <div className="px-4 py-3 space-y-2">
                  <p>Under section 44 of the Electronic Communications and Transactions Act 25 of 2002, a consumer may cancel an electronic transaction within <strong>7 days</strong> without reason or penalty. The Consumer Protection Act 68 of 2008 also applies to consumer transactions.</p>
                  <p className="text-gray-500">These rights are for consumers. They generally do not apply where you are buying for a business.</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-900">United Kingdom &amp; European Union</div>
                <div className="px-4 py-3 space-y-2">
                  <p>Consumers have a <strong>14-day</strong> right to cancel a distance contract. For digital services, that right ends once supply has begun with your express consent and your acknowledgement that you lose the right — which is what you agree to when you start using a paid plan immediately.</p>
                  <p className="text-gray-500">Our goodwill refund in section 1 gives you the same 14 days regardless, so in practice you are no worse off.</p>
                </div>
              </div>

              <p>If you are a consumer, you keep the mandatory protections of the country where you live.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" /> 3. Subscriptions after the first 14 days
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Beyond the goodwill window, subscription fees are not refundable — but cancelling is free and immediate:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cancel any time from your account settings</li>
                <li>You keep full access until the end of the period you have paid for</li>
                <li>You are not charged again</li>
                <li>Your data stays available for export</li>
              </ul>
              <p><strong>Annual plans</strong> are not refunded pro-rata if you cancel mid-term. You keep access for the remainder of the year you paid for.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" /> 4. Practitioner client slots
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Practitioner plans are billed per client slot, with a minimum of two. Please note:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Adding slots charges you immediately</strong> for the remainder of the current period.</li>
                <li><strong>Removing slots does not produce a refund.</strong> The reduction is scheduled and takes effect at your next renewal date. You keep the capacity you paid for until then.</li>
                <li>The two-slot minimum is billed whether or not you use both.</li>
              </ul>
              <p>If you added slots by mistake, tell us within 48 hours and we will sort it out. We would rather fix an honest error than argue about it.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. One-off document and template purchases</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Individual documents and templates bought from the Store are delivered immediately, so they are not refundable once accessed or downloaded — except where consumer law says otherwise, or where:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You were charged more than once for the same item</li>
                <li>The item did not work, or was materially different from its description</li>
                <li>You have not opened or downloaded it</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. When we will refund you regardless</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Outside every window above, we will refund you if:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>We charged you in error</strong> — duplicate charges, wrong amount, or a charge after you cancelled. Refunded in full, always.</li>
                <li><strong>You paid but never got an account</strong> — payment taken and setup never completed.</li>
                <li><strong>We materially change or withdraw a feature you are paying for</strong> — we refund the unused portion of your prepaid period.</li>
                <li><strong>We change our Terms materially and you do not accept</strong> — cancel before the change takes effect and we refund the unused portion.</li>
                <li><strong>We close your account without cause</strong> — the unused portion is refunded.</li>
              </ul>
              <p className="text-gray-500">An account closed for breach of the Terms is not refunded.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" /> 7. How to ask, and what happens
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <ol className="list-decimal pl-6 space-y-1">
                <li>Email <a href="mailto:support@sormalitics.com" className="text-blue-600 hover:underline">support@sormalitics.com</a> from your registered address</li>
                <li>Tell us which payment, and roughly why — a sentence is plenty</li>
                <li>We acknowledge within 2 business days</li>
                <li>We decide and process within 5 business days of acknowledging</li>
                <li>Refunds go back to the original payment method, in the original currency</li>
              </ol>
              <p>Your bank or card issuer may take a further 5–10 business days to show the credit. Exchange-rate movement between payment and refund is outside our control.</p>
              <p><strong>If we say no</strong> and you disagree, reply and ask for it to be reviewed — a different person will look at it. If you are still unhappy, you may take it to your consumer authority: the National Consumer Commission in South Africa, or your national body in the UK or EU. Please come to us first; it is usually quicker.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Chargebacks</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>If you think a charge is wrong, please contact us before raising a chargeback with your bank. We can usually resolve it faster, and a chargeback may suspend your account automatically while the dispute runs — including your access to your own documents.</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" /> Contact
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Refunds and billing: <a href={`mailto:${CONTACT.support}`} className="text-blue-600 hover:underline">{CONTACT.support}</a></p>
              <p>Telephone: {CONTACT.phone} — {CONTACT.hours}</p>
              <p className="pt-2 text-gray-600">
                Customers in the UK and EU contract with {POLOMPA.registeredName} (no. {POLOMPA.registrationNumber}). Customers elsewhere contract with {ALLOBTEQ.registeredName} (reg. {ALLOBTEQ.registrationNumber}). See <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link> §1.2.
              </p>
            </div>
          </section>

        </div>

        <div className="mt-10 text-center text-sm text-gray-600">
          <p>This Refund Policy forms part of our <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.</p>
        </div>
      </div>
    </div>
  );
}
