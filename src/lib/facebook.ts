let sdkPromise: Promise<void> | null = null;

const FACEBOOK_APP_ID = '1094705089173300';

export function loadFacebookSDK(): Promise<void> {
  if (window.FB) {
    return Promise.resolve();
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      try {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v25.0',
        });

        console.log('Facebook SDK initialized');

        resolve();
      } catch (error) {
        sdkPromise = null;
        reject(error);
      }
    };

    const existingScript = document.getElementById(
      'facebook-jssdk',
    );

    if (existingScript) {
      // The script already exists.
      // If FB is already available, initialize through fbAsyncInit.
      if (window.FB) {
        window.fbAsyncInit();
      }

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