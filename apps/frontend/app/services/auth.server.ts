import { createCookieSessionStorage } from "@remix-run/node";

// セッションストレージの設定
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-key";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 7, // 7 days
		path: "/",
		sameSite: "lax",
		secrets: [SESSION_SECRET],
		secure: process.env.NODE_ENV === "production",
	},
});

// OAuth設定
export const OAUTH_CONFIG = {
	clientId: process.env.OAUTH_CLIENT_ID || "",
	clientSecret: process.env.OAUTH_CLIENT_SECRET || "",
	redirectUri:
		process.env.OAUTH_REDIRECT_URI || "http://localhost:5173/auth/callback",
	authorizeUrl: "https://api.intra.42.fr/oauth/authorize",
	tokenUrl: "https://api.intra.42.fr/oauth/token",
};

// State生成関数（CSRF対策）
export function generateState(): string {
	return Array.from(crypto.getRandomValues(new Uint8Array(32)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// 認可URLを生成
export function generateAuthorizationUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: OAUTH_CONFIG.clientId,
		redirect_uri: OAUTH_CONFIG.redirectUri,
		scope: "public",
		response_type: "code",
		state: state,
	});

	return `${OAUTH_CONFIG.authorizeUrl}?${params.toString()}`;
}

// トークン交換
export async function exchangeCodeForToken(
	code: string,
): Promise<{ access_token: string; expires_in: number }> {
	const params = new URLSearchParams({
		grant_type: "authorization_code",
		client_id: OAUTH_CONFIG.clientId,
		client_secret: OAUTH_CONFIG.clientSecret,
		code: code,
		redirect_uri: OAUTH_CONFIG.redirectUri,
	});

	const response = await fetch(OAUTH_CONFIG.tokenUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Token exchange failed: ${error}`);
	}

	return response.json();
}

// ユーザー情報を取得
export async function getUserInfo(accessToken: string): Promise<{
	id: number;
	login: string;
	email: string;
	image_url: string;
}> {
	const response = await fetch("https://api.intra.42.fr/v2/me", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch user info");
	}

	return response.json();
}
