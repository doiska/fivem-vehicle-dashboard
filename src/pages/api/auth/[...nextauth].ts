import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";

// OAuth Providers.
import Discord from "next-auth/providers/discord";

export const nextAuthConfig: NextAuthOptions = {
	providers: [
		Discord({
			clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
			clientId: process.env.DISCORD_CLIENT_ID as string,
		}),
	],

	// Session config.
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days,
	},

	secret: "SECRET_LOL",

	// Pages
	pages: {
		signIn: "/unauth",
		// signOut: '/auth/signout',
		error: "/unauth", // Error code passed in query string as ?error=
		// verifyRequest: '/auth/verify-request', // (used for check email message)
		// newUser: '/auth/new-user', // New users will be directed here on first sign in (leave the property out if not of interest)
	},

	/**
	 * Callbacks for actions.
	 */
	callbacks: {
		/**
		 * @todo Login attempt logs.
		 */
		signIn: async ({ profile, credentials, account }) => {
			// Verify the provider is discord, logic check for creds is above.
			if (account && account.provider === "discord") {
				// Make sure the discord profile exist.
				if (!profile) {
					throw new Error("An error occured while processing.");
				}

				// Grab the discord id from the profile object.
				const discord_id = account.providerAccountId ?? undefined;

				// If there is not a linked account return an error.
				if (!discord_id) {
					return `/auth/login?${new URLSearchParams({
						error: "Could not find account associated with this discord, please login with your credentials.",
					})}`;
				}

				// Return true is all checks pass.
				return true;
			}

			return true;
		},
		/**
		 * Session handling, collect our data for the frontend session here.
		 * Important to try and keep it as small as possible.
		 */
		session: async ({ session, token, user }) => {
			let newSession = { ...session };

			return newSession;
		},
		/**
		 * This is where we pass data to the jwt token before it's sign.
		 * Very important to keep it as small as possible.
		 */
		jwt: async ({ token, account, user, profile }) => {
			return token;
		},
	},
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	/* Any pre-auth logic we want to run. */
	return await NextAuth(req, res, nextAuthConfig);
};

export default handler;
