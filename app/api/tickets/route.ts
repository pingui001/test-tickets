import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/app/models/Tickets";
import User from "@/app/models/User";
import { sendEmail } from "@/lib/email";
import mongoose from "mongoose";

connectDB();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("user");

    let tickets;
    if (userEmail) {
      const user = await User.findOne({ email: userEmail }).lean();
      if (!user) return NextResponse.json([], { status: 200 });
      tickets = await Ticket.find({ createdBy: user._id }).lean();
    } else {
      tickets = await Ticket.find({}).lean();
    }

    return NextResponse.json(tickets);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.createdBy) return NextResponse.json({ error: "Missing createdBy" }, { status: 400 });

    const ticket = await Ticket.create({
      title: body.title,
      description: body.description,
      createdBy: new mongoose.Types.ObjectId(body.createdBy),
      status: "open",
      priority: "medium",
    });

    const user = await User.findById(body.createdBy).lean();
    if (user) {
      await sendEmail(
        user.email,
        `Ticket creado: ${ticket.title}`,
        `<p>Tu ticket ha sido creado exitosamente.</p>
         <p><strong>Título:</strong> ${ticket.title}</p>
         <p><strong>Descripción:</strong> ${ticket.description}</p>`
      );
    }

    return NextResponse.json(ticket);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Ticket ID missing" }, { status: 400 });

    const updates = await req.json();

    const ticket = await Ticket.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    if (updates.comment || updates.status === "closed") {
      const user = await User.findById(ticket.createdBy).lean();
      if (user) {
        let subject = "";
        let html = "";
        if (updates.comment) {
          subject = `Nuevo comentario en tu ticket: ${ticket.title}`;
          html = `<p>Un agente ha agregado un comentario:</p><p>${updates.comment}</p>`;
        } else if (updates.status === "closed") {
          subject = `Ticket cerrado: ${ticket.title}`;
          html = `<p>Tu ticket ha sido cerrado por el agente.</p>`;
        }
        await sendEmail(user.email, subject, html);
      }
    }

    return NextResponse.json(ticket);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Ticket ID missing" }, { status: 400 });

    const ticket = await Ticket.findByIdAndDelete(id).lean();
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
