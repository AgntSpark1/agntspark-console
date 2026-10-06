import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useBillingStatus, useStartCheckout } from '../hooks/useBilling';

/**
 * /upgrade — where the website's "Get Pro" button lands. Signed-out visitors
 * are sent to sign in first and come back here; then this starts Stripe
 * Checkout straight away instead of making them find Settings → Plan & Billing.
 */
export default function Upgrade() {
  const statusQ = useBillingStatus();
  const checkout = useStartCheckout();
  const started = useRef(false);
  const status = statusQ.data;
  const canCheckout = !!status && status.enabled && status.plan !== 'pro';

  useEffect(() => {
    if (canCheckout && !started.current) {
      started.current = true;
      checkout.mutate();
    }
  }, [canCheckout, checkout]);

  let body: React.ReactNode;
  if (statusQ.isLoading) {
    body = <Waiting text="Checking your plan…" />;
  } else if (statusQ.isError || !status) {
    body = <p className="text-sm text-rose-400">Couldn't load your plan. Refresh the page to try again.</p>;
  } else if (!status.enabled) {
    body = (
      <p className="text-sm text-slate-400">
        Paid plans aren't open yet. During the alpha an admin can change your plan.
      </p>
    );
  } else if (status.plan === 'pro') {
    body = (
      <p className="text-sm text-slate-400">
        You're already on Pro. Manage your subscription under{' '}
        <Link to="/settings?billing=current" className="text-brand-400 hover:underline">
          Plan &amp; Billing
        </Link>
        .
      </p>
    );
  } else if (checkout.isError) {
    body = (
      <>
        <p className="text-sm text-rose-400">{(checkout.error as Error).message}</p>
        <button
          onClick={() => checkout.mutate()}
          className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Try again
        </button>
      </>
    );
  } else {
    body = <Waiting text="Taking you to secure checkout on Stripe…" />;
  }

  return (
    <div className="max-w-lg rounded-xl border border-surface-3 bg-surface-1 p-6">
      <h1 className="mb-1 text-base font-semibold text-white">Upgrade to Pro</h1>
      <p className="mb-5 text-xs text-slate-500">$29/month · 20 agents · 8 GB memory · 3,000 requests/min per agent</p>
      {body}
    </div>
  );
}

function Waiting({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text}
    </p>
  );
}
