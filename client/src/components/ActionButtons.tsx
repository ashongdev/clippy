interface Props {
	text: string;
	account: any;
	isLoading: boolean;
	handleCreate: () => void;
	handleGet: () => Promise<void>;
	handleDelete: () => Promise<void>;
	inputMode: "create" | "fetch";
}

const ActionButtons = ({
	text,
	account,
	isLoading,
	handleCreate,
	handleDelete,
	handleGet,
	inputMode,
}: Props) => {
	return (
		<div className="action-buttons">
			{inputMode === "create" ? (
				<button
					className="btn btn-primary btn-full"
					onClick={handleCreate}
					disabled={!account || isLoading || !text.trim()}
				>
					{isLoading ? (
						<span className="btn-loading">
							<span className="spinner"></span>
							Processing...
						</span>
					) : (
						<>
							<span className="btn-icon">📋</span>
							Create Clip
						</>
					)}
				</button>
			) : (
				<div className="button-group">
					<button
						className="btn btn-secondary"
						onClick={handleGet}
						disabled={!account || isLoading || !text.trim()}
					>
						{isLoading ? (
							<span className="spinner"></span>
						) : (
							<>
								<span className="btn-icon">🔍</span>
								Fetch
							</>
						)}
					</button>
					<button
						className="btn btn-danger"
						onClick={handleDelete}
						disabled={!account || isLoading || !text.trim()}
					>
						{isLoading ? (
							<span className="spinner"></span>
						) : (
							<>
								<span className="btn-icon">🗑️</span>
								Delete
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
};

export default ActionButtons;
