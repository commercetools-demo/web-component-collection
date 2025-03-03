interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CommercetoolsConfig {
  projectKey: string;
  authUrl: string;
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}


const config: CommercetoolsConfig = {
  projectKey: import.meta.env.CTP_PROJECT_KEY,
  authUrl: import.meta.env.CTP_AUTH_URL,
  apiUrl: import.meta.env.CTP_API_URL,
  clientId: import.meta.env.CTP_CLIENT_ID,
  clientSecret: import.meta.env.CTP_CLIENT_SECRET,
  scopes: [import.meta.env.CTP_SCOPES ?? 'default'],
};


let accessToken: string | null = null;
let tokenExpirationTime: number | null = null;

async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  // Get new token
  const response = await fetch(`${config.authUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: config.scopes.join(' '),
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data: AuthResponse = await response.json();
  accessToken = data.access_token;
  // Set expiration time 5 minutes before actual expiration for safety
  tokenExpirationTime = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

export async function makeCtRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getAccessToken();
  
  const response = await fetch(
    `${config.apiUrl}/${config.projectKey}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json();
}
