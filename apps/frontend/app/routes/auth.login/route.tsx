import { type LoaderFunction, redirect } from "@remix-run/node";
import {
	generateAuthorizationUrl,
	generateState,
	sessionStorage,
} from "../../services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
	// 既存のセッションがあればダッシュボードにリダイレクト
	const session = await sessionStorage.getSession(
		request.headers.get("Cookie"),
	);
	if (session.has("accessToken")) {
		return redirect("/dashboard");
	}

	// Stateを生成
	const state = generateState();

	// 認可URLを生成
	const authUrl = generateAuthorizationUrl(state);

	// Stateをセッションに保存（コールバック時に検証するため）
	const newSession = await sessionStorage.getSession();
	newSession.set("oauthState", state);

	return redirect(authUrl, {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(newSession),
		},
	});
};

export default function LoginRoute() {
	return <div>Redirecting to OAuth provider...</div>;
}
