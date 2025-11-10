import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { networkConfig } from "./networkConfig";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Theme appearance="light">
			<QueryClientProvider client={queryClient}>
				<SuiClientProvider
					networks={networkConfig}
					defaultNetwork="testnet"
				>
					<WalletProvider autoConnect>
						<App />
					</WalletProvider>
				</SuiClientProvider>
			</QueryClientProvider>
		</Theme>
	</StrictMode>
);
