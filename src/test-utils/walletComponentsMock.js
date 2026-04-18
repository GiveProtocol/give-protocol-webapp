// Mock for Wallet barrel export (WalletButton, NetworkSelector, NETWORKS, types)

export const WalletButton = ({ address }) => (
  <div data-testid="wallet-button">{address}</div>
);

export const WalletDropdown = () => (
  <div data-testid="wallet-dropdown">Wallet Dropdown</div>
);

export const NetworkSelector = () => (
  <div data-testid="network-selector">Network Selector</div>
);

export const NETWORKS = [
  { id: "base", name: "Base", token: "ETH", color: "#0052FF", chainType: "evm" },
  { id: "moonbase", name: "Moonbase Alpha", token: "DEV", color: "#53CBC8", chainType: "evm" },
];

export const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
export const getAddressGradient = () => "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
export const getExplorerUrl = () => "#";
export const formatBalance = (bal) => bal;
export const formatUsdValue = (val) => `$${val}`;
export const copyToClipboard = () => Promise.resolve();
export const NETWORK_NAMES = {};
export const NETWORK_TOKENS = {};
export const PROVIDER_NAMES = {};
