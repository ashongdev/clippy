import type { Dispatch, SetStateAction } from "react";

interface Props {
	text: string;
	account: any;
	isLoading: boolean;
	charCount: number;
	maxChars: number;
	setText: Dispatch<SetStateAction<string>>;
}

const Create = ({
	text,
	setText,
	maxChars,
	account,
	isLoading,
	charCount,
}: Props) => {
	return (
		<>
			<div className="input-wrapper">
				<textarea
					className="clip-textarea"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Enter your text to store on-chain..."
					maxLength={maxChars}
					disabled={!account || isLoading}
				/>
				<div className="char-counter">
					<span
						className={charCount > maxChars * 0.9 ? "warning" : ""}
					>
						{charCount} / {maxChars}
					</span>
				</div>
			</div>

			<div className="gas-estimate">
				<span className="gas-label">Estimated gas:</span>
				<span className="gas-value">~ 0.002 SUI</span>
			</div>
		</>
	);
};

export default Create;
