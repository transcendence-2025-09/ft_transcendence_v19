import { type LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sessionStorage } from "../../services/auth.server";

type LoaderData = {
	user: {
		id: number;
		login: string;
		email: string;
		image_url: string;
	};
};

export const loader: LoaderFunction = async ({ request }) => {
	const session = await sessionStorage.getSession(
		request.headers.get("Cookie"),
	);

	// トークンがない場合はログインページにリダイレクト
	if (!session.has("accessToken")) {
		return redirect("/");
	}

	const user = session.get("user");

	return { user };
};

export default function DashboardRoute() {
	const { user } = useLoaderData<LoaderData>();

	return (
		<div style={{ padding: "20px" }}>
			<h1>Dashboard</h1>
			<div
				style={{
					backgroundColor: "#f5f5f5",
					padding: "20px",
					borderRadius: "8px",
					maxWidth: "400px",
				}}
			>
				<h2>Welcome, {user.login}!</h2>
				<p>
					<strong>ID:</strong> {user.id}
				</p>
				<p>
					<strong>Email:</strong> {user.email}
				</p>
				{user.image_url && (
					<img
						src={user.image_url}
						alt="Profile"
						style={{ width: "100px", height: "100px", borderRadius: "50%" }}
					/>
				)}
			</div>
		</div>
	);
}
