import {
	ConnectButton,
	useCurrentAccount,
	useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useEffect, useState } from "react";
import ActionButtons from "./components/ActionButtons";
import Create from "./components/Create";
import FetchOrDelete from "./components/FetchOrDelete";
import History from "./components/History";
import InfoCards from "./components/InfoCards";

interface ClipHistoryItem {
	id: string;
	action: "create" | "get" | "delete";
	timestamp: Date;
	txDigest?: string;
	preview: string;
}

const App = () => {
	const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

	const account = useCurrentAccount();
	const [text, setText] = useState<string>("");
	const [clipContent, setClipContent] = useState<any>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [notification, setNotification] = useState<{
		type: "success" | "error" | "info";
		message: string;
		txHash?: string;
	} | null>(null);
	const [clipHistory, setClipHistory] = useState<ClipHistoryItem[]>([]);
	const [showHistory, setShowHistory] = useState<boolean>(false);
	const [charCount, setCharCount] = useState<number>(0);
	const [inputMode, setInputMode] = useState<"create" | "fetch">("create");
	const [objectId, setObjectId] = useState<string | undefined>("");

	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const maxChars = 1000;

	useEffect(() => {
		setCharCount(text.length);
	}, [text]);

	// Load history from localStorage
	useEffect(() => {
		const savedHistory = localStorage.getItem("clipHistory");
		if (savedHistory) {
			const parsed = JSON.parse(savedHistory);
			setClipHistory(
				parsed.map((item: any) => ({
					...item,
					timestamp: new Date(item.timestamp),
				}))
			);
		}
	}, []);

	const saveHistory = (item: ClipHistoryItem) => {
		const newHistory = [item, ...clipHistory].slice(0, 50);
		setClipHistory(newHistory);
		localStorage.setItem("clipHistory", JSON.stringify(newHistory));
	};

	const showNotification = (
		type: "success" | "error" | "info",
		message: string,
		txHash?: string
	) => {
		setNotification({ type, message, txHash });
		setTimeout(() => setNotification(null), 5000);
	};

	const handleCreate = () => {
		if (!account) {
			showNotification("error", "Please connect your wallet first");
			return;
		}

		if (!text.trim()) {
			showNotification("error", "Please enter some text to store");
			return;
		}

		setIsLoading(true);
		const txb = new Transaction();

		try {
			txb.moveCall({
				target: "0xe67f5d4edc01c1f513b5d961b1a0ebe725e2faf8a3f34bbea5df4378daa16a08::clippy::create_clip",
				arguments: [txb.pure("string", text)],
			});

			signAndExecute(
				{ transaction: txb },
				{
					onSuccess: async (result) => {
						const tx = await suiClient.getTransactionBlock({
							digest: result.digest,
							options: { showEffects: true },
						});
						if (tx.effects?.created) {
							setObjectId(
								tx.effects?.created[0].reference.objectId
							);
						}

						showNotification(
							"success",
							"Clip stored on-chain successfully!",
							result.digest
						);
						saveHistory({
							id: result.digest,
							action: "create",
							timestamp: new Date(),
							txDigest: result.digest,
							preview: text.substring(0, 50),
						});
						setText("");
						setIsLoading(false);
					},
					onError: (error) => {
						console.log(error);
						showNotification(
							"error",
							"Transaction failed. Please try again."
						);
						setIsLoading(false);
					},
				}
			);
		} catch (error) {
			console.log("🚀 ~ handleCreate ~ error:", error);
			showNotification("error", "Failed to create transaction");
			setIsLoading(false);
		}
	};

	const handleGet = async () => {
		if (!account) {
			showNotification("error", "Please connect your wallet first");
			return;
		}

		if (!text.trim()) {
			showNotification("error", "Please enter an object ID");
			return;
		}

		setIsLoading(true);

		try {
			const clip = await suiClient.getObject({
				id: text,
				options: { showContent: true },
			});

			if (clip.error) {
				setClipContent("This object was deleted or doesn't exist");
				showNotification("error", "Object not found or was deleted");
				setIsLoading(false);
				return;
			}

			const content = clip.data?.content;
			let bytes: number[] | undefined;

			if (content && (content as any).dataType === "moveObject") {
				bytes = (content as any).fields?.text as number[] | undefined;
			}

			if (!bytes) {
				setClipContent("No content available");
				showNotification("info", "Object found but contains no text");
				setIsLoading(false);
				return;
			}

			const text1 = new TextDecoder().decode(Uint8Array.from(bytes));
			setClipContent(text1);
			showNotification("success", "Clip fetched successfully!");
			saveHistory({
				id: text,
				action: "get",
				timestamp: new Date(),
				preview: text1.substring(0, 50),
			});
			setIsLoading(false);
		} catch (error) {
			console.log("🚀 ~ handleGet ~ error:", error);
			showNotification(
				"error",
				"Failed to fetch clip. Check the object ID."
			);
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!account) {
			showNotification("error", "Please connect your wallet first");
			return;
		}

		if (!text.trim()) {
			showNotification("error", "Please enter an object ID to delete");
			return;
		}

		setIsLoading(true);

		try {
			const txb = new Transaction();
			txb.moveCall({
				target: "0xe67f5d4edc01c1f513b5d961b1a0ebe725e2faf8a3f34bbea5df4378daa16a08::clippy::delete_clip",
				arguments: [txb.object(text)],
			});

			signAndExecute(
				{ transaction: txb },
				{
					onSuccess: (result) => {
						console.log(result);
						showNotification(
							"success",
							"Clip deleted from blockchain",
							result.digest
						);
						saveHistory({
							id: result.digest,
							action: "delete",
							timestamp: new Date(),
							txDigest: result.digest,
							preview: text,
						});
						setClipContent("Clip deleted successfully");
						setText("");
						setIsLoading(false);
					},
					onError: (error) => {
						console.log(error);
						showNotification("error", "Delete transaction failed");
						setIsLoading(false);
					},
				}
			);
		} catch (error) {
			console.log("🚀 ~ handleDelete ~ error:", error);
			showNotification("error", "Failed to delete clip");
			setIsLoading(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(clipContent);
		showNotification("success", "Copied to clipboard!");
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	return (
		<div className="app-container">
			<div className="background-animation">
				<div className="orb orb-1"></div>
				<div className="orb orb-2"></div>
				<div className="orb orb-3"></div>
			</div>

			{notification && (
				<div
					className={`notification notification-${notification.type}`}
				>
					<div className="notification-icon">
						{notification.type === "success" && "✓"}
						{notification.type === "error" && "✕"}
						{notification.type === "info" && "ℹ"}
					</div>
					<div className="notification-content">
						<p className="notification-message">
							{notification.message}
						</p>
						{notification.txHash && (
							<p className="notification-hash">
								Tx: {formatAddress(notification.txHash)}
							</p>
						)}
					</div>
					<button
						className="notification-close"
						onClick={() => setNotification(null)}
					>
						×
					</button>
				</div>
			)}

			<div className="main-container">
				<header className="app-header">
					<div className="header-content">
						<div className="logo-section">
							<div className="logo-icon">📋</div>
							<div>
								<h1 className="app-title">
									Blockchain Clipboard
								</h1>
								<p className="app-subtitle">
									Decentralized text storage on Sui
								</p>
							</div>
						</div>

						<div className="header-actions">
							{account && (
								<div className="wallet-info">
									<div className="wallet-indicator"></div>
									<span className="wallet-address">
										{formatAddress(account.address)}
									</span>
								</div>
							)}
							<div className="connect-button-wrapper">
								<ConnectButton />
							</div>
						</div>
					</div>
				</header>

				<div className="content-grid">
					<div className="panel input-panel">
						<div className="panel-header">
							<h2 className="panel-title">
								{inputMode === "create"
									? "Create New Clip"
									: "Fetch Clip"}
							</h2>
							<div className="mode-toggle">
								<button
									className={`mode-btn ${
										inputMode === "create" ? "active" : ""
									}`}
									onClick={() => setInputMode("create")}
								>
									Create
								</button>
								<button
									className={`mode-btn ${
										inputMode === "fetch" ? "active" : ""
									}`}
									onClick={() => setInputMode("fetch")}
								>
									Fetch
								</button>
							</div>
						</div>

						<div className="input-section">
							{inputMode === "create" ? (
								<>
									<Create
										account={account}
										charCount={charCount}
										isLoading={isLoading}
										maxChars={maxChars}
										setText={setText}
										text={text}
									/>
									{objectId && (
										<div
											className="gas-estimate"
											style={{
												display: "flex",
												flexDirection: "column",
												justifyContent: "flex-start",
												alignItems: "flex-start",
											}}
										>
											<span className="gas-label">
												Object Created(ID):
											</span>
											<span
												className="gas-value"
												style={{ fontSize: "1.2rem" }}
											>
												{objectId}
											</span>
										</div>
									)}
								</>
							) : (
								<FetchOrDelete
									account={account}
									text={text}
									setText={setText}
									isLoading={isLoading}
								/>
							)}
						</div>

						<ActionButtons
							account={account}
							handleCreate={handleCreate}
							handleDelete={handleDelete}
							handleGet={handleGet}
							inputMode={inputMode}
							isLoading={isLoading}
							text={text}
						/>

						{!account && (
							<div className="connect-prompt">
								<p>
									Connect your wallet to start using the
									clipboard
								</p>
							</div>
						)}
					</div>

					<div className="panel output-panel">
						<div className="panel-header">
							<h2 className="panel-title">Stored Content</h2>
							{clipContent &&
								clipContent !== "No content yet" && (
									<button
										className="copy-btn"
										onClick={copyToClipboard}
									>
										<span className="btn-icon">📄</span>
										Copy
									</button>
								)}
						</div>

						<div className="content-display">
							{clipContent ? (
								<>
									<pre className="content-text">
										{clipContent}
									</pre>
									{clipContent !== "No content yet" &&
										!clipContent.includes("deleted") && (
											<div className="content-meta">
												<span className="content-badge">
													On-chain verified
												</span>
											</div>
										)}
								</>
							) : (
								<div className="empty-state">
									<div className="empty-icon">📭</div>
									<p className="empty-title">
										No content yet
									</p>
									<p className="empty-subtitle">
										Create or fetch a clip to see it here
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				<History
					formatAddress={formatAddress}
					clipHistory={clipHistory}
					showHistory={showHistory}
					setShowHistory={setShowHistory}
				/>

				<InfoCards />
			</div>
		</div>
	);
};

export default App;
