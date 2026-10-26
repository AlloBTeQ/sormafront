import { Download, Trash2, Mail } from 'lucide-react';
import { APP_URL } from '@/lib/site';

export function PrivacyActions() {
  const btn = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium';
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Export or delete your data from inside your account. You&rsquo;ll be asked to sign in first.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={`${APP_URL}/legal/privacy`} className={`${btn} border-gray-300 text-gray-800 hover:bg-gray-50`}>
          <Download className="w-4 h-4" /> Export my data
        </a>
        <a href={`${APP_URL}/legal/privacy`} className={`${btn} border-gray-300 text-gray-800 hover:bg-gray-50`}>
          <Trash2 className="w-4 h-4" /> Delete my account
        </a>
        <a href="mailto:privacy@sormalitics.com" className={`${btn} border-gray-300 text-gray-800 hover:bg-gray-50`}>
          <Mail className="w-4 h-4" /> Email our privacy officer
        </a>
      </div>
    </div>
  );
}
