import { app } from '@/lib/site';

export default function NotFound() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-28">
      <p className="text-xs tracking-[0.12em] mb-3" style={{ fontFamily: 'var(--font-dm-mono)', color: '#C9A227' }}>404</p>
      <h1 className="text-4xl font-extrabold mb-4">That page isn&rsquo;t here.</h1>
      <p className="mb-8" style={{ color: '#ADC4DC' }}>
        Looking for your books? The app lives at its own address.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="/" className="px-6 py-4 text-[15px] font-semibold" style={{ background: '#C9A227', color: '#143152' }}>Home</a>
        <a href={app('/auth/login')} className="px-6 py-4 text-[15px]" style={{ border: '1px solid #4B71A0' }}>Sign in to the app</a>
      </div>
    </section>
  );
}
