import type { Dispatch, SetStateAction } from "react";

interface Props {
	text: string;
	setText: Dispatch<SetStateAction<string>>;
	account: any;
	isLoading: boolean;
}

const FetchOrDelete = ({ text, isLoading, account, setText }: Props) => {
	return (
		<div className="input-wrapper">
			<input
				className="clip-input"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Enter object ID to fetch or delete..."
				disabled={!account || isLoading}
			/>
			<div className="gas-estimate">
				<span className="gas-label">Estimated gas:</span>
				<span className="gas-value">~ 0.002 SUI</span>
			</div>
			<div className="input-hint">
				Enter the object ID to fetch or delete.
			</div>
		</div>
	);
};

export default FetchOrDelete;
