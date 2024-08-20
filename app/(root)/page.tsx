import HeaderBox from "@/components/HeaderBox";
import RightSideBar from "@/components/RightSideBar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";

export default async function Home() {
	const loggedIn =await getLoggedInUser();
	return (
		<section className="home">
			<div className="home-content">
				<header className="home-header">
					<HeaderBox
						type="greeting"
						title="Welcome"
						subtext="Access your financial data"
						user={loggedIn.name}
					/>

					<TotalBalanceBox accounts={[]} totalBanks={0} totalCurrentBalance={10000} />
				</header>
			</div>

			{/* righsidebar */}
			<RightSideBar
				user={loggedIn}
				transaction={[]}
				banks={[{ currentBalance: 1000 }, { currentBalance: 2000 }]}
			/>
		</section>
	);
}
