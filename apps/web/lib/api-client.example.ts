/**
 * Example usage of the generated API client
 * 
 * This file demonstrates how to use the auto-generated API client
 * in your React components and server-side code.
 */

import { Api } from '@/lib/generated/api';

// ============================================================================
// Basic Usage
// ============================================================================

// 1. Initialize the API client
const api = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// 2. Call API endpoints with full type safety (organized by service)
async function exampleLogin() {
  try {
    const response = await api.auth.authControllerLogin({
      email: 'user@example.com',
      password: 'password123',
    });
    
    // Response is unwrapped - directly accessible
    console.log('Access Token:', response.accessToken);
    console.log('User:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

async function exampleRegister() {
  try {
    await api.auth.authControllerRegister({
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
    });
    console.log('Registration successful');
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// ============================================================================
// With Authentication
// ============================================================================

// Create an authenticated API client
const authenticatedApi = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    Authorization: 'Bearer YOUR_JWT_TOKEN_HERE',
  },
});

// Now all requests will include the Authorization header
async function authenticatedExample() {
  // This request will automatically include the Bearer token
  const response = await authenticatedApi.auth.authControllerLogin({
    email: 'user@example.com',
    password: 'password123',
  });
  
  return response;
}

// ============================================================================
// Dynamic Token Management
// ============================================================================

class ApiClient {
  private api: Api;
  
  constructor(baseURL: string) {
    this.api = new Api({ baseURL });
  }
  
  // Set token dynamically
  setAuthToken(token: string) {
    this.api = new Api({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  // Wrapper methods
  async login(email: string, password: string) {
    return this.api.auth.authControllerLogin({ email, password });
  }
  
  async register(email: string, password: string, firstName: string, lastName: string) {
    return this.api.auth.authControllerRegister({
      email,
      password,
      firstName,
      lastName,
    });
  }
}

// Usage
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

// After login, set the token
const loginResponse = await apiClient.login('user@example.com', 'password123');
apiClient.setAuthToken(loginResponse.accessToken);

// Now make authenticated requests
// await apiClient.someAuthenticatedMethod();

// ============================================================================
// React Component Example
// ============================================================================

/**
 * Example React component using the generated API client
 */
export function ExampleLoginComponent() {
  const handleLogin = async () => {
    const api = new Api({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    });
    
    try {
      const response = await api.auth.authControllerLogin({
        email: 'user@example.com',
        password: 'password123',
      });
      
      // Store token in localStorage or state management
      localStorage.setItem('accessToken', response.accessToken);
      console.log('Logged in as:', response.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <button onClick={handleLogin}>
      Login
    </button>
  );
}

// ============================================================================
// Error Handling
// ============================================================================

async function exampleWithErrorHandling() {
  const api = new Api({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  });
  
  try {
    const response = await api.auth.authControllerLogin({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    });
    
    console.log('Success:', response);
  } catch (error: any) {
    if (error.response) {
      // Axios error
      console.error('API Error:', error.response.status);
      console.error('Error Message:', error.response.data.message);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

