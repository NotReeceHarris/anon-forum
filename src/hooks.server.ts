import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import prisma from '$lib/server/prisma';

/**
 * Decodes and verifies a JWT token.
 * @param token - The JWT token to decode and verify.
 * @returns The decoded token payload if valid, otherwise null.
 */
function decodeJwt(token: string): { data: { id: string }, iat: number } | null {
    try {
        // Verify the token using the JWT secret and return the decoded payload
        return jwt.verify(token, JWT_SECRET) as { data: { id: string }, iat: number };
    } catch (error) {
        // Log the error if JWT verification fails
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * SvelteKit handle function to process requests and responses.
 * This function is executed for every request and can modify the event or response.
 */
export const handle: Handle = async ({ event, resolve }) => {
    // Get the session token from the cookies
    const token = event.cookies.get('session');

    // If a session token exists, attempt to decode and verify it
    if (token) {
        const decodedJwt = decodeJwt(token);

        // If the token is valid, fetch the user from the database
        if (decodedJwt) {
            const user = await prisma.user.findUnique({
                where: { id: decodedJwt.data.id },
            });

            // If the user exists, attach user details to event.locals for use in other parts of the app
            if (user) {
                event.locals.user = {
                    id: user.id,
                };
            }
        }
    }

    // Resolve the event and return the response
    return await resolve(event);
};