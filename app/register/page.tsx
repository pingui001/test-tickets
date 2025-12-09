"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Slide, Zoom } from "react-toastify";
import styles from "@/styles/auth.module.scss";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error al registrarse", {
          transition: Zoom,
        });
        setLoading(false);
        return;
      }

      toast.success("Cuenta creada correctamente", {
        transition: Slide,
      });

      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/tickets",
      });

      if (loginRes?.ok) {
        setTimeout(() => {
          router.replace("/tickets");
        }, 800);
      } else {
        toast.error("Error al iniciar sesión automática", {
          transition: Zoom,
        });
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado", {
        transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    toast.info("Redirigiendo a Google...", { transition: Slide });

    await signIn("google", {
      callbackUrl: "/tickets",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Regístrate para acceder al dashboard
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={form.name}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className={styles.divider}>o</div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          className={styles.googleButton}
        >
          <img src="/google.svg" alt="Google" />
          Registrarse con Google
        </button>

        <p className={styles.linkText}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
