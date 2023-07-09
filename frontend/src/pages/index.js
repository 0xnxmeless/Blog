import { Space_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

const Home = () => {
	return (
		<main className={`${styles.container} ${spaceMono.className}`}>
			<h1>Hello, world!</h1>
		</main>
	);
}

export default Home;
