import { NextApiRequest, NextApiResponse } from "next";
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/app/models/Tickets";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const session = await getSession({ req });

  if (!session?.user?.id) return res.status(401).json({ message: "No autorizado" });

  if (req.method === "GET") {
    // Cliente: filtra solo sus tickets
    const filter: any = {};
    if (req.query.user) filter.createdBy = session.user.id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tickets = await Ticket.find(filter).populate("assignedTo").populate("createdBy");
    return res.status(200).json(tickets);
  }

  if (req.method === "POST") {
    const { title, description } = req.body;
    const ticket = await Ticket.create({
      title,
      description,
      createdBy: session.user.id,
    });
    return res.status(201).json(ticket);
  }

  res.status(405).json({ message: "Método no permitido" });
}
