import { Conversation } from "@xmtp/browser-sdk";
import { useState } from "react";
import useXMTP from "./use-xmtp";

export enum ConversationFilter {
  DM = "dm",
  GROUP = "group",
}

export default function useXMTPConversation() {
  const { client } = useXMTP({
    options: {
      env: "dev",
    },
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const createConversation = async (addresses: string[]) => {
    console.log("[XMTP] Creating new conversation with addresses:", addresses);
    if (!client) {
      console.error(
        "[XMTP] Failed to create conversation: Client not initialized"
      );
      throw new Error("Client not initialized");
    }
    if (addresses.length === 0) {
      console.error(
        "[XMTP] Failed to create conversation: No addresses provided"
      );
      throw new Error("Addresses are required");
    }
    let conversation: Conversation;
    try {
      if (addresses.length === 1) {
        console.log("[XMTP] Creating new DM conversation with:", addresses[0]);
        conversation = await client.conversations.newDm(addresses[0]);
      } else {
        console.log(
          "[XMTP] Creating new group conversation with addresses:",
          addresses
        );
        conversation = await client.conversations.newGroup(addresses);
      }
      console.log("[XMTP] Successfully created conversation");
      syncConversations();
      setConversations([...conversations, conversation]);
      return conversation;
    } catch (error) {
      console.error("[XMTP] Failed to create conversation:", error);
      throw error;
    }
  };

  const syncConversations = async () => {
    console.log("[XMTP] Starting conversation sync");
    if (!client) {
      console.error(
        "[XMTP] Failed to sync conversations: Client not initialized"
      );
      throw new Error("Client not initialized");
    }
    try {
      await client.conversations.sync();
      console.log("[XMTP] Successfully synced conversations");
      await fetchConversations();
    } catch (error) {
      console.error("[XMTP] Failed to sync conversations:", error);
      throw error;
    }
  };

  const fetchConversations = async (filter?: ConversationFilter) => {
    console.log("[XMTP] Fetching conversations with filter:", filter || "none");
    if (!client) {
      console.error(
        "[XMTP] Failed to fetch conversations: Client not initialized"
      );
      throw new Error("Client not initialized");
    }
    try {
      let conversations: Conversation[];
      if (filter === ConversationFilter.DM) {
        conversations = await client.conversations.listDms();
      } else if (filter === ConversationFilter.GROUP) {
        conversations = await client.conversations.listGroups();
      } else {
        conversations = await client.conversations.list();
      }
      console.log(
        `[XMTP] Successfully fetched ${conversations.length} conversations`
      );
      setConversations(conversations);
    } catch (error) {
      console.error("[XMTP] Failed to fetch conversations:", error);
      throw error;
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    console.log("[XMTP] Sending message to conversation:", conversationId);
    if (!client) {
      console.error("[XMTP] Failed to send message: Client not initialized");
      throw new Error("Client not initialized");
    }
    try {
      const conversation = await client.conversations.getConversationById(
        conversationId
      );
      if (!conversation) {
        console.error(
          "[XMTP] Failed to send message: Conversation not found:",
          conversationId
        );
        throw new Error("Conversation not found");
      }
      await conversation.send(message);
      console.log(
        "[XMTP] Successfully sent message to conversation:",
        conversationId
      );
    } catch (error) {
      console.error("[XMTP] Failed to send message:", error);
      throw error;
    }
  };

  return {
    conversations,
    createConversation,
    syncConversations,
    fetchConversations,
    sendMessage,
  };
}
