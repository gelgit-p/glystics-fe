export {};

declare global {
  interface Window {
    FB: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;

      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: {
          config_id?: string;
          response_type?: string;
          override_default_response_type?: boolean;
          extras?: Record<string, unknown>;
        },
      ) => void;
    };

    fbAsyncInit: () => void;
  }

  interface FacebookLoginResponse {
    status: string;

    authResponse?: {
      accessToken?: string;
      userID?: string;
      expiresIn?: number;
      signedRequest?: string;
      code?: string;
    };
  }
}