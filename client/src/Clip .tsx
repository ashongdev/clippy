import {
	ConnectButton,
	useCurrentAccount,
	useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

const CreateClip = () => {
	const account = useCurrentAccount();
	const [text, setText] = useState<string>("vector<u8>");
	const [clipContent, setClipContent] = useState<any>("");
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	const handleCreate = () => {
		if (!account) return;
		const txb = new Transaction();
		try {
			txb.moveCall({
				target: "0xe67f5d4edc01c1f513b5d961b1a0ebe725e2faf8a3f34bbea5df4378daa16a08::clippy::create_clip",
				arguments: [
					txb.pure("string", text), // vector<u8>
				],
			});

			signAndExecute(
				{
					transaction: txb,
				},
				{
					onSuccess: (result) => {
						console.log(result);
					},
					onError: (error) => {
						console.log(error);
					},
				}
			);
		} catch (error) {
			console.log("🚀 ~ handleCreate ~ error:", error);
		}
	};

	const handleGet = async () => {
		if (!account) return;

		try {
			const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
			const clip = await suiClient.getObject({
				id: text,
				options: { showContent: true },
			});
			console.log("🚀 ~ handleGet ~ clip:", clip);

			if (clip.error) {
				setClipContent(
					"This object was deleted. You can view its history at https://suiscan.xyz"
				);
				return;
			}
			setClipContent(clip.data?.content);

			const content = clip.data?.content;
			let bytes: number[] | undefined;
			if (content && (content as any).dataType === "moveObject") {
				bytes = (content as any).fields?.text as number[] | undefined;
			}

			if (!bytes) {
				setClipContent("");
				return;
			}
			const text1 = new TextDecoder().decode(Uint8Array.from(bytes));
			setClipContent(text1);
		} catch (error) {
			console.log("🚀 ~ handleGet ~ error:", error);
		}
	};

	const handleDelete = async () => {
		if (!account) return;

		try {
			const txb = new Transaction();
			txb.moveCall({
				target: "0xe67f5d4edc01c1f513b5d961b1a0ebe725e2faf8a3f34bbea5df4378daa16a08::clippy::delete_clip",
				arguments: [txb.object(text)],
			});
			signAndExecute(
				{
					transaction: txb,
				},
				{
					onSuccess: (result) => {
						console.log(result);
					},
					onError: (error) => {
						console.log(error);
					},
				}
			);
			setClipContent("Clip deleted");
		} catch (error) {
			console.log("🚀 ~ handleGet ~ error:", error);
		}
	};

	return (
		<div>
			<input
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Enter clip text"
			/>
			{account ? (
				<>
					<button onClick={handleCreate}>Create Clip</button>
					<button onClick={handleGet}>Get Clip</button>
					<button onClick={handleDelete}>Delete Clip</button>
				</>
			) : (
				<ConnectButton />
			)}

			<h1>Content: {clipContent}</h1>
		</div>
	);
};

export default CreateClip;
