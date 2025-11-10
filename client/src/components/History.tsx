import type { Dispatch, SetStateAction } from "react";

interface Props {
	clipHistory: ClipHistoryItem[];
	formatAddress: (address: string) => string;
	setShowHistory: Dispatch<SetStateAction<boolean>>;
	showHistory: boolean;
}
interface ClipHistoryItem {
	id: string;
	action: "create" | "get" | "delete";
	timestamp: Date;
	txDigest?: string;
	preview: string;
}

const History = ({
	clipHistory,
	formatAddress,
	setShowHistory,
	showHistory,
}: Props) => {
	const formatTimestamp = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	return (
		<div className="panel history-panel">
			<div className="panel-header">
				<h2 className="panel-title">
					<span className="title-icon">📜</span>
					Transaction History
				</h2>
				<button
					className="toggle-btn"
					onClick={() => setShowHistory(!showHistory)}
				>
					{showHistory ? "Hide" : "Show"}
				</button>
			</div>

			{showHistory && (
				<div className="history-content">
					{clipHistory.length > 0 ? (
						<div className="history-list">
							{clipHistory.map((item, index) => (
								<div key={index} className="history-item">
									<div className="history-icon-wrapper">
										<div
											className={`history-icon history-${item.action}`}
										>
											{item.action === "create" && "📝"}
											{item.action === "get" && "📥"}
											{item.action === "delete" && "🗑️"}
										</div>
									</div>
									<div className="history-details">
										<div className="history-action">
											{item.action
												.charAt(0)
												.toUpperCase() +
												item.action.slice(1)}
										</div>
										<div className="history-preview">
											{item.preview}...
										</div>
										{item.txDigest && (
											<div className="history-tx">
												Tx:{" "}
												{formatAddress(item.txDigest)}
											</div>
										)}
									</div>
									<div className="history-time">
										{formatTimestamp(item.timestamp)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="history-empty">
							<p>No transactions yet</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default History;
