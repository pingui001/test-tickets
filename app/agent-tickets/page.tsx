"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ITicket } from "@/app/models/Tickets";
import styles from "@/styles/agent-tickets.module.scss";

export default function AgentTickets() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);

  // Protección de ruta: solo agent
  useEffect(() => {
    if (status === "unauthenticated" || session?.user.role !== "agent") {
      router.push("/login");
    }
  }, [status, session]);

  useEffect(() => {
    axios.get("/api/tickets").then(res => setTickets(res.data));
  }, []);

  const updateTicket = async (id: string, updates: Partial<ITicket>) => {
    // Convertir status y priority a tipos permitidos
    if (updates.status) updates.status = updates.status as "open" | "in_progress" | "resolved" | "closed";
    if (updates.priority) updates.priority = updates.priority as "low" | "medium" | "high";

    const res = await axios.put(`/api/tickets?id=${id}`, updates);
    setTickets(tickets.map(t => (t._id.toString() === id ? res.data : t)));
  };

  return (
    <div className={styles.container}>
      <h1>Tickets del sistema</h1>

      <button className={styles.logoutButton} onClick={() => signOut({ callbackUrl: "/login" })}>
        Cerrar sesión
      </button>

      <div className={styles.ticketList}>
        {tickets.map(ticket => (
          <div key={ticket._id.toString()} className={styles.ticketCard}>
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>

            <select
              value={ticket.status}
              onChange={e => updateTicket(ticket._id.toString(), { status: e.target.value as "open" | "in_progress" | "resolved" | "closed" })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={ticket.priority}
              onChange={e => updateTicket(ticket._id.toString(), { priority: e.target.value as "low" | "medium" | "high" })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

          </div>
        ))}
      </div>
    </div>
  );
}
