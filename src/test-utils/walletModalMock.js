// Mock for WalletModal — satisfies ConnectButton test assertions
export const WalletModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div data-testid="wallet-modal">
      <h3>Connect Wallet</h3>
      <button type="button" onClick={onClose} aria-label="Close modal">&times;</button>
      <button type="button" data-chaintype="evm">EVM</button>
      <button type="button" data-chaintype="solana">Solana</button>
      <button type="button" data-chaintype="polkadot">Polkadot</button>
    </div>
  );
};
