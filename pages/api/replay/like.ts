import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { prisma } from "@/libs/prisma";
import serverAuth from "@/libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "POST" && req.method !== "DELETE")
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).end();
  else {
    try {
      const { currentUser } = await serverAuth(req, res);
      const replayId = req.method === "POST" ? req.body.replayId : req.query.replayId;
      if (!replayId || typeof replayId != "string") throw new Error("Invalid replay id");
      const replay = await prisma.replay.findUnique({
        where: {
          id: replayId,
        },
      });

      if (!replay) throw new Error("Invalid replay id");
      let updatedLikeIds = [...(replay.likesId || [])];
      //
      if (req.method === "POST") {
        updatedLikeIds.push(currentUser.id);
        try {
          if (replay?.userId) {
            if (!currentUser.id && typeof currentUser.id != "string")
              throw new Error("Invalid user id");
            if (updatedLikeIds.includes(currentUser.id)) {
              await prisma.notification.create({
                data: {
                  userId: replay.userId,
                  body: `${currentUser.name} liked your replay`,
                  type: "like",
                  fromId: currentUser.id,
                  link: `/replay/${replay.id}`,
                  isRead: false,
                },
              });
            }
            await prisma.user.update({
              where: {
                id: replay.userId,
              },
              data: {
                hasNotifications: true,
              },
            });
          }
        } catch (error: any) {
          console.log("NotificationError", error.message);
        }
      } else if (req.method === "DELETE") {
        if (updatedLikeIds.includes(currentUser.id)) {
          updatedLikeIds = updatedLikeIds.filter((id: string) => id != currentUser.id);
        }
        try {
          if ((updatedLikeIds = updatedLikeIds.filter((id: string) => id != currentUser.id))) {
            await prisma.notification.deleteMany({
              where: {
                userId: replay.userId,
                fromId: currentUser.id,
                type: "like",
                link: `/replay/${replay.id}`,
              },
            });
          }
          await prisma.user.update({
            where: {
              id: replay.userId,
            },
            data: {
              hasNotifications: false,
            },
          });
        } catch (error: any) {
          console.log("NotificationError", error.message);
        }
      }
      const updatedReplay = await prisma.replay.update({
        where: {
          id: replayId,
        },
        data: {
          likesId: updatedLikeIds,
        },
      });
      res.status(StatusCodes.OK).json(updatedReplay);
    } catch (error: any) {
      res.status(StatusCodes.BAD_REQUEST).json(error.message);
    }
  }
}
