const InfoCards = () => {
	return (
		<div className="info-cards">
			<div className="info-card">
				<div className="info-icon">⚡</div>
				<div className="info-content">
					<h3>Instant Storage</h3>
					<p>Store text on Sui blockchain in seconds</p>
				</div>
			</div>
			<div className="info-card">
				<div className="info-icon">🔒</div>
				<div className="info-content">
					<h3>Decentralized</h3>
					<p>Your data is stored on-chain, not on servers</p>
				</div>
			</div>
			<div className="info-card">
				<div className="info-icon">♾️</div>
				<div className="info-content">
					<h3>Permanent</h3>
					<p>Access your clips anytime with the object ID</p>
				</div>
			</div>
		</div>
	);
};

export default InfoCards;
