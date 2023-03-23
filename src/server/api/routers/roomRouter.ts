import { env } from "@/env.mjs";
import axios from "axios";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const getRoomIdResponseSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  hostWallets: z.array(z.string()),
  roomLock: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  roomUrl: z.string(),
});

const joinRoomResponseSchema = z.object({
  roomUrl: z.string(),
  accessToken: z.string(),
  joiningLink: z.string(),
});

const roomIdRouter = createTRPCRouter({
  getRoomId: publicProcedure
    .input(
      z.object({
        title: z.string(),
        hostWallets: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { title, hostWallets } = input;
      const { data } = await axios.request<typeof getRoomIdResponseSchema>({
        method: "POST",
        url: "https://us-central1-nfts-apis.cloudfunctions.net/createroom",
        data: {
          title,
          hostWallets,
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "x-ai-key": env.HUDDLE01_API_KEY,
        },
      });

      const resp = getRoomIdResponseSchema.parse(data);
      return resp;
    }),
  joinRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        name: z.string(),
        type: z.union([z.literal("host"), z.literal("guest")]),
      })
    )
    .mutation(async ({ input }) => {
      const { roomId, name, type } = input;

      const { data } = await axios.request<typeof joinRoomResponseSchema>({
        method: "POST",
        url: "https://us-central1-nfts-apis.cloudfunctions.net/joinroom",
        data: {
          type,
          name,
          roomId,
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "x-ai-key": env.HUDDLE01_API_KEY,
        },
      });

      const resp = joinRoomResponseSchema.parse(data);
      return resp;
    }),
});

export default roomIdRouter;
