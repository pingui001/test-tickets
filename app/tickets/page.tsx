"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ITicket } from "@/app/models/Tickets";
import styles from "@/styles/tickets.module.scss";

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Protección de ruta: solo client
  useEffect(() => {
    if (status === "unauthenticated" || session?.user.role !== "client") {
      router.push("/login");
    }
  }, [status, session]);

  useEffect(() => {
    if (session?.user?.email) {
      axios.get(`/api/tickets?user=${session.user.email}`).then(res => setTickets(res.data));
    }
  }, [session]);

  const createTicket = async () => {
    if (!session?.user?.id) return;

    const res = await axios.post("/api/tickets", { 
      title, 
      description,
      createdBy: session.user.id
    });

    setTickets([...tickets, res.data]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className={styles.container}>
      <h1>Mis Tickets</h1>

      <button className={styles.logoutButton} onClick={() => signOut({ callbackUrl: "/login" })}>
        Cerrar sesión
      </button>

      <div className={styles.ticketList}>
        {tickets.map(ticket => (
          <div key={ticket._id.toString()} className={styles.ticketCard}>
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>
            <p>Status: {ticket.status} | Priority: {ticket.priority}</p>
          </div>
        ))}
      </div>

      <div className={styles.newTicketForm}>
        <h2>Crear nuevo ticket</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
        <button onClick={createTicket}>Crear Ticket</button>
      </div>
    </div>
  );
}
