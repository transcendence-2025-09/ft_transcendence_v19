import { Link } from "@remix-run/react";

export default function IndexRoute() {
	return (
		<div style={{ textAlign: "center", marginTop: "50px" }}>
			<h1>Welcome to ft_transcendence</h1>
			<p>Login with your 42 School account</p>
			<Link
				to="/auth/login"
				style={{
					display: "inline-block",
					padding: "10px 20px",
					backgroundColor: "#0066ff",
					color: "white",
					textDecoration: "none",
					borderRadius: "4px",
					marginTop: "20px",
				}}
			>
				Login with 42
			</Link>
		</div>
	);
}
