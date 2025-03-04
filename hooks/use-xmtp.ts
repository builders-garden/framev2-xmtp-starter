import { Client, type ClientOptions, type Signer } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";

export default function useXMTP({ options }: { options: ClientOptions }) {
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<Signer>();
  const encryptionKey = window.crypto.getRandomValues(new Uint8Array(32));
  const [client, setClient] = useState<Client | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("[useXMTP] Initializing XMTP client...", {
      hasWalletClient: !!walletClient,
      isInitialized,
      options,
    });

    const init = async () => {
      if (!walletClient) {
        console.log(
          "[useXMTP] No wallet client available, skipping initialization"
        );
        return;
      }
      if (isInitialized) {
        console.log("[useXMTP] Already initialized, skipping");
        return;
      }

      console.log(
        "[useXMTP] Creating signer with address:",
        walletClient.account.address
      );
      const signer: Signer = {
        getAddress: () => walletClient?.account.address!,
        signMessage: async (message) => {
          console.log("[useXMTP] Signing message...");
          // Convert hex signature to Uint8Array
          const signature = await walletClient?.signMessage({
            message,
          });
          if (!signature) {
            console.error("[useXMTP] Failed to sign message");
            throw new Error("Failed to sign message");
          }
          const bytes = Buffer.from(signature.slice(2), "hex");
          return new Uint8Array(bytes);
        },
        walletType: "EOA",
      };

      console.log("[useXMTP] Signer created successfully");

      try {
        console.log("[useXMTP] Creating XMTP client...", {
          signer,
          encryptionKey,
          options,
        });
        const client = await Client.create(
          signer,
          encryptionKey,
          options /* optional */
        );
        console.log("[useXMTP] XMTP client created successfully");
        setClient(client);
        setIsInitialized(true);
      } catch (error) {
        console.error("[useXMTP] Failed to create XMTP client:", error);
        throw error;
      }
    };
    init();
  }, [walletClient, encryptionKey, options, isInitialized]);

  return { client, signer, isInitialized };
}
