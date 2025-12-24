import { json, type LoaderFunction, redirect } from "@remix-run/node";
import {
	exchangeCodeForToken,
	getUserInfo,
	sessionStorage,
} from "../../services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	// エラーレスポンスの確認
	const error = url.searchParams.get("error");
	if (error) {
		return json({ error: error }, { status: 400 });
	}

	// codeがない場合
	if (!code) {
		return json({ error: "Missing authorization code" }, { status: 400 });
	}

	// セッションから保存されたstateを取得
	const session = await sessionStorage.getSession(
		request.headers.get("Cookie"),
	);
	const savedState = session.get("oauthState");

	// CSRF対策：stateを検証
	if (!state || state !== savedState) {
		return json(
			{ error: "State mismatch - CSRF attack detected" },
			{ status: 403 },
		);
	}

	try {
		// トークン交換
		const tokenData = await exchangeCodeForToken(code);

		// ユーザー情報を取得
		const userInfo = await getUserInfo(tokenData.access_token);

		// セッションにトークンとユーザー情報を保存
		session.set("accessToken", tokenData.access_token);
		session.set("user", {
			id: userInfo.id,
			login: userInfo.login,
			email: userInfo.email,
			image_url: userInfo.image_url,
		});

		// oauthStateはクリア
		session.unset("oauthState");

		return redirect("/dashboard", {
			headers: {
				"Set-Cookie": await sessionStorage.commitSession(session),
			},
		});
	} catch (error) {
		console.error("OAuth callback error:", error);
		return json({ error: "Authentication failed" }, { status: 500 });
	}
};
