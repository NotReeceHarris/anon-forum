import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { JWT_SECRET, HASH_ROUNDS, SHA256_SALT, ARGON2_MEMORY_COST, ARGON2_TIME_COST, ARGON2_PARALLELISM, ARGON2_VERSION, INVITE_CODE, MAX_INVITES } from '$env/static/private';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';

const ARGON2_FLAG = `$argon2id$v=${ARGON2_VERSION}$m=${ARGON2_MEMORY_COST},t=${ARGON2_TIME_COST},p=${ARGON2_PARALLELISM}$`;

// Utility Functions
function splitString(str: string): [string, string] {
    const mid = Math.ceil(str.length / 2);
    return [str.slice(0, mid), str.slice(mid)];
}

function generateRandomNumberString(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function hashPassword(password: string): string {
    const [salt1, salt2] = splitString(SHA256_SALT);
    let hashedPassword = password;

    for (let i = 0; i < parseInt(HASH_ROUNDS); i++) {
        const [hash1, hash2] = splitString(hashedPassword);
        hashedPassword = crypto.createHash('sha256').update(`${salt1}${hash1}${salt2}${hash2}`).digest('hex');
    }

    return hashedPassword;
}

// Helper Functions
async function validateInviteCode(inviteCode: string) {
    if (INVITE_CODE && inviteCode === INVITE_CODE) {
        return { usedPublic: true, invitingUser: null };
    }

    const invitingUser = await prisma.user.findUnique({
        include: { _count: { select: { referredUsers: true } } },
        where: { reference: inviteCode },
    });

    if (invitingUser && invitingUser._count.referredUsers >= parseInt(MAX_INVITES)) {
        throw new Error('Invite code has been used too many times');
    }

    if (!invitingUser) {
        throw new Error('Invalid invite code');
    }

    return { usedPublic: false, invitingUser };
}

async function generateUniqueUsername(): Promise<string> {
    let username;
    do {
        username = `anon-${generateRandomNumberString(8)}`;
    } while (await prisma.user.count({ where: { username } }));
    return username;
}

async function createUser(username: string, password: string, invitingUserId?: string) {
    const argon2Hash = (await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: parseInt(ARGON2_MEMORY_COST),
        timeCost: parseInt(ARGON2_TIME_COST),
        parallelism: parseInt(ARGON2_PARALLELISM),
        version: parseInt(ARGON2_VERSION),
    })).replace(ARGON2_FLAG, '');

    return prisma.user.create({
        data: {
            username,
            password: argon2Hash,
            ...(invitingUserId ? { referredBy: { connect: { id: invitingUserId } } } : {}),
        },
    });
}

// Actions
export const actions = {
    login: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!username || !password) {
            return fail(400, { error: 'Username and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return fail(401, { error: 'Invalid username or password' });
        }

        const hashedPassword = hashPassword(password);
        const passwordMatch = await argon2.verify(`${ARGON2_FLAG}${user.password}`, hashedPassword);

        if (!passwordMatch) {
            return fail(401, { error: 'Invalid username or password' });
        }

        const token = jwt.sign({ data: { id: user.id } }, JWT_SECRET, { expiresIn: '1h' });
        cookies.set('session', token, { path: '/', httpOnly: true, secure: true, sameSite: 'strict' });

        return { success: true };
    },

    register: async ({ cookies, request }) => {
        const data = await request.formData();
        const password = data.get('password')?.toString();
        const inviteCode = data.get('invite')?.toString();

        if (!password || !inviteCode) {
            return fail(400, { error: 'Password and invite code are required' });
        }

        try {
            const { invitingUser } = await validateInviteCode(inviteCode);
            const username = await generateUniqueUsername();
            const hashedPassword = hashPassword(password);

            const user = await createUser(username, hashedPassword, invitingUser ? invitingUser.id : undefined);

            const token = jwt.sign({ data: { id: user.id } }, JWT_SECRET, { expiresIn: '1h' });
            cookies.set('session', token, { path: '/', httpOnly: true, secure: true, sameSite: 'strict' });

            return { success: true, message: { username } };
        } catch {
            return fail(400, { error: 'Internal server error' });
        }
    },
} satisfies Actions;

// Load
export const load: PageServerLoad = ({ locals }) => {
    console.log('locals:', locals);
    if (locals.user) redirect(307, '/');
};