"use client";

import { useState } from "react";
import styles from "@/styles/sendMail.module.scss";
import { toast } from "react-toastify"; 

export default function SendMailPage() {
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          asunto,
          mensajeHtml: `<p>${mensaje}</p>`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Correo enviado correctamente", {
          position: "top-right",
          autoClose: 3000,
          transition: undefined,
        });

        setEmail("");
        setAsunto("");
        setMensaje("");
      } else {
        toast.error(data.error || "Error al enviar el correo", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error("Error inesperado al enviar el correo", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h1 className={styles.title}>Enviar Correo</h1>
        <p className={styles.subtitle}>Pon los datos de la persona que quiere enviar un correo</p>

        <div className={styles.group}>
          <label>Destinatario</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div className={styles.group}>
          <label>Asunto</label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Asunto del correo"
            required
          />
        </div>

        <div className={styles.group}>
          <label>Mensaje</label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            placeholder="Escribe el mensaje aquí..."
            required
          />
        </div>

        <button disabled={loading} className={styles.button}>
          {loading ? "Enviando..." : "Enviar correo"}
        </button>
      </form>
    </main>
  );
}
