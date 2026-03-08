import { useEffect } from 'react';
import { useStore } from '../store/store';

const VAPID_PUBLIC_KEY = 'BHLrZfkeLqHRN13-ffnSucHtJYFqNf5oxOduH6HQzRUsgjC39KCGGGXOAkuu6qFtpchHmi3nPZvjfYFz46WAI-fo';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const currentUser = useStore((state) => state.currentUser);

    useEffect(() => {
        if (!currentUser) return;

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    if (!subscription) {
                        // Not subscribed yet, ask for permission and subscribe
                        Notification.requestPermission().then((permission) => {
                            if (permission === 'granted') {
                                registration.pushManager.subscribe({
                                    userVisibleOnly: true,
                                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                                }).then((newSubscription) => {
                                    sendSubscriptionToServer(newSubscription, currentUser.email);
                                }).catch((error) => {
                                    console.error('Failed to subscribe user:', error);
                                });
                            }
                        });
                    } else {
                        // Already subscribed, we might want to update it on the server
                        sendSubscriptionToServer(subscription, currentUser.email);
                    }
                });
            });
        }
    }, [currentUser]);

    const sendSubscriptionToServer = async (subscription: PushSubscription, email: string) => {
        try {
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription, email }),
            });
        } catch (error) {
            console.error('Error sending subscription to server:', error);
        }
    };
}
