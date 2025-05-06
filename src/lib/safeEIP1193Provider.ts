import { EventEmitter } from "events";

export class SafeEIP1193Provider extends EventEmitter {
  constructor(private safeClient: any) {
    super();
  }

  // EIP-1193 `request` method
  async request(args: { method: string; params?: any[] }) {
    const { method, params } = args;

    switch (method) {
      case "eth_chainId":
        return `0x${this.safeClient.chain.id.toString(16)}`;
      case "eth_accounts":
        return [await this.safeClient.account.getAddress()];
      case "eth_sendTransaction":
        if (!params || !params.length) throw new Error("Invalid params");
        return this.safeClient.sendTransaction(params[0]);
      case "eth_sign":
        if (!params || params.length < 2) throw new Error("Invalid params");
        return this.safeClient.signMessage({ message: params[1] });
      // Handle other methods...
      default:
        throw new Error(`Method ${method} not implemented`);
    }
  }

  // Add helper functions for convenience
  getChainId() {
    return this.safeClient.chain.id;
  }

  getAddress() {
    return this.safeClient.account.getAddress();
  }
}