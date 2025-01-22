// Import jwt-decode library
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number; // Token expiration time (in seconds since the epoch)
}

class AuthService {
  /**
   * Decodes the JWT token to retrieve user information.
   * @returns Decoded user profile or null if no token is found.
   */
  getProfile(): UserToken | null {
    const token = this.getToken();
    return token ? jwtDecode<UserToken>(token) : null;
  }

  /**
   * Checks if the user is logged in by verifying the existence and validity of the token.
   * @returns True if logged in, false otherwise.
   */
  loggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Checks if the provided token has expired.
   * @param token The JWT token to validate.
   * @returns True if the token is expired, false otherwise.
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000; // Compare expiration time with the current time
    } catch (err) {
      console.error('Failed to decode token:', err);
      return true; // Treat token as expired if it can't be decoded
    }
  }

  /**
   * Retrieves the JWT token from localStorage.
   * @returns The token or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem('id_token');
  }

  /**
   * Saves the JWT token to localStorage and redirects the user to the homepage.
   * @param idToken The JWT token to save.
   */
  login(idToken: string): void {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/'); // Redirect to the homepage after login
  }

  /**
   * Removes the JWT token from localStorage and reloads the page to reset the application state.
   */
  logout(): void {
    localStorage.removeItem('id_token');
    window.location.assign('/'); // Redirect to the homepage after logout
  }
}

export default new AuthService();