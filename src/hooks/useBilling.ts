import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

/** agntspark-gateway GET /v1/billing. */
export interface BillingStatus {
  /** False when Stripe isn't configured on the server. */
  enabled: boolean;
  plan: string;
  subscription_status: string | null;
  has_billing_account: boolean;
}

export const billingKeys = {
  status: ['billing', 'status'] as const,
};

export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status,
    queryFn: async () => {
      const { data } = await apiClient.get<BillingStatus>('/billing');
      return data;
    },
  });
}

/** Both endpoints return a Stripe-hosted URL to send the browser to. */
function useStripeRedirect(path: '/billing/checkout' | '/billing/portal') {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ url: string }>(path);
      return data.url;
    },
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}

export const useStartCheckout = () => useStripeRedirect('/billing/checkout');
export const useOpenBillingPortal = () => useStripeRedirect('/billing/portal');
