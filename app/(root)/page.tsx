import HeaderBox from "@/components/HeaderBox";
import RightSideBar from "@/components/RightSideBar";
import TotalBalanceBox from "@/components/TotalBalanceBox";

export default function Home() {
	const loggedIn = { firstName: "Quang", lastName: "Nguyen Duy" };
	return (
		<section className="home">
			<div className="home-content">
				<header className="home-header">
					<HeaderBox
						type="greeting"
						title="Welcome"
						subtext="Access your financial data"
						user={loggedIn.firstName}
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
