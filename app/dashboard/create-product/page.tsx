"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styles from "@/styles/createProduct.module.scss";

export default function CreateProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!image) {
      toast.error("Debes seleccionar una imagen");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", image);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("Producto creado correctamente");
      router.push("/dashboard");
    } else {
      toast.error("Error al crear producto");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h1>Crear Producto</h1>

        <input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          required
        />

        <button disabled={loading}>
          {loading ? "Subiendo..." : "Crear producto"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className={styles.back}
        >
          Volver al dashboard
        </button>
      </form>
    </div>
  );
}
