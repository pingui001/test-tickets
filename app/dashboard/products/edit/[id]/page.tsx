"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import styles from "@/styles/productForm.module.scss";


export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Error cargando el producto");
          return;
        }

        setForm({
          name: data.name,
          price: data.price,
          image: data.image,
        });

        setPreview(data.image); 
      } catch (error) {
        toast.error("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (form.image) {
      setPreview(form.image);
    }
  }, [form.image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Error al actualizar producto");
        return;
      }

      toast.success("Producto actualizado correctamente");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error inesperado al guardar cambios");
    }
  };

  if (loading) return <p className="p-4">Cargando producto...</p>;

  return (
  <div className={styles.container}>
    <h1>Editar producto</h1>

    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
      />

      <input
        type="number"
        name="price"
        placeholder="Precio"
        value={form.price}
        onChange={handleChange}
      />

      <input
        type="text"
        name="image"
        placeholder="URL de la imagen"
        value={form.image}
        onChange={handleChange}
      />

      {preview && (
        <div className={styles.preview}>
          <p>Preview imagen:</p>
          <Image
            src={preview}
            alt="Preview"
            width={300}
            height={300}
          />
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit">Guardar cambios</button>
        <button type="button" onClick={() => router.back()}>
          Cancelar
        </button>
      </div>
    </form>
  </div>
);}
