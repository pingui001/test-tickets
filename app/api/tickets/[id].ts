import { NextApiRequest, NextApiResponse } from "next";
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/app/models/Tickets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "PUT") {
    const updates = req.body; // {status?, priority?, assignedTo?}
    const ticket = await Ticket.findByIdAndUpdate(id, updates, { new: true });
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    return res.status(200).json(ticket);
  }

  res.status(405).json({ message: "Método no permitido" });
}
