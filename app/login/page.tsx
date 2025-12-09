"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast, Zoom, Slide } from "react-toastify";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth.module.scss";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false, // IMPORTANTE
    });

    setLoading(false);

    if (res?.ok) {
      toast.success("Sesión iniciada correctamente", {
        transition: Slide,
      });

      // Obtener sesión completa para conocer el rol
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      if (sessionData?.user?.role === "agent") {
        router.push("/agent-tickets"); // panel agente
      } else {
        router.push("/tickets"); // panel cliente
      }
    } else {
      console.error(res);
      toast.error("Correo o contraseña incorrectos", {
        transition: Zoom,
      });
    }
  };

  const handleGoogle = async () => {
    toast.info("Abriendo Google...", { transition: Slide });

    // Redirección según rol no funciona automáticamente con Google, 
    // por defecto se envía a dashboard, luego se puede hacer check en /dashboard
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  // Si ya hay sesión activa, redirigir automáticamente según rol
  useEffect(() => {
    if (session?.user?.role) {
      if (session.user.role === "agent") router.push("/agent-tickets");
      else router.push("/tickets");
    }
  }, [session]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <button
          className={styles.googleButton}
          onClick={handleGoogle}
          type="button"
        >
          <img src="/google.svg" alt="Google" width="15" height="15" />
          Continuar con Google
        </button>

        <p className={styles.linkText}>
          ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
