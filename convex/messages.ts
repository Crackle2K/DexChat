import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .unique();

        let avatarUrl = null;
        if (profile?.avatarId) {
          avatarUrl = await ctx.storage.getUrl(profile.avatarId);
        }

        return {
          ...message,
          author: {
            name: profile?.displayName || author?.name || author?.email || "Unknown",
            avatarUrl,
          },
        };
      })
    );
  },
});

export const send = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: userId,
      content: args.content,
    });
  },
});

export const search = query({
  args: {
    query: v.string(),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!args.query.trim()) {
      return [];
    }

    const searchQuery = ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", args.query);
        if (args.channelId) {
          search = search.eq("channelId", args.channelId);
        }
        return search;
      })
      .take(20);

    const messages = await searchQuery;

    return await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .unique();
        const channel = await ctx.db.get(message.channelId);

        let avatarUrl = null;
        if (profile?.avatarId) {
          avatarUrl = await ctx.storage.getUrl(profile.avatarId);
        }

        return {
          ...message,
          author: {
            name: profile?.displayName || author?.name || author?.email || "Unknown",
            avatarUrl,
          },
          channel: channel?.name || "Unknown",
        };
      })
    );
  },
});
