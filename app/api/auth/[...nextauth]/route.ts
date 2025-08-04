import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export handlers for HTTP methods
export { handler as GET, handler as POST };