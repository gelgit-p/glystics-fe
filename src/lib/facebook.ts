let sdkPromise: Promise<void> | null = null;

export function loadFacebookSDK(): Promise<void> {
  if (window.FB) {
    return Promise.resolve();
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: '1094705089173300',
        cookie: true,
        xfbml: true,
        version: 'v25.0',
      });

      resolve();
    };

    const existingScript = document.getElementById(
      'facebook-jssdk',
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = 'facebook-jssdk';
    script.src =
      'https://connect.facebook.net/en_US/sdk.js';

    script.async = true;
    script.defer = true;

    script.onerror = () => {
      sdkPromise = null;
      reject(
        new Error('Failed to load Facebook SDK'),
      );
    };

    document.body.appendChild(script);
  });

  return sdkPromise;
}