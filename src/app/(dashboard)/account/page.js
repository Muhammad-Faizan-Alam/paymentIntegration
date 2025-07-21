'use client';
import { useState, useEffect } from 'react';

export default function AccountPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscriptions/get');
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-container">
      <h1>Your Account</h1>
      <div className="account-details">
        {subscription ? (
          <div className="subscription-info">
            <h2>Your Subscription</h2>
            <p>Plan: {subscription.plan}</p>
            <p>Status: {subscription.status}</p>
            <p>
              Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
            <button onClick={handleManageSubscription}>
              Manage Subscription
            </button>
          </div>
        ) : (
          <div className="no-subscription">
            <p>You don't have an active subscription</p>
            <a href="/pricing">View Plans</a>
          </div>
        )}
      </div>
    </div>
  );

  async function handleManageSubscription() {
    const response = await fetch('/api/subscriptions/create-portal-session');
    const { url } = await response.json();
    window.location.href = url;
  }
}