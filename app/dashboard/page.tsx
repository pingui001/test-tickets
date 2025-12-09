"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/dashboard.module.scss";

import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
) => {
  let timeout: NodeJS.Timeout | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };
  return debounced;
};

export default function DashboardPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const exists = current.find((item) => item._id === product._id);
      if (exists) {
        return current.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    setCart((current) =>
      current.map((item) => (item._id === id ? { ...item, quantity } : item))
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    });

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce(() => {
      setPage(1);
      fetchProducts();
    }, 400),
    [search, minPrice, maxPrice]
  );

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchProducts();
      alert("Producto eliminado");
    } catch {
      alert("Error al eliminar");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Navbar className={styles.navbar}>
        <NavbarBrand>
          <h1>Inicio productos de todo tipo aquí</h1>
        </NavbarBrand>

        <NavbarContent className={styles.navbarActions}>
          <Button className={styles.primary} onPress={() => router.push("/send-mail")}>
            Enviar correo
          </Button>
          <Button className={styles.primary} onPress={() => router.push("/dashboard/create-product")}>
            Crear producto
          </Button>
          <Button className={styles.danger} onPress={() => signOut({ callbackUrl: "/" })}>
            Cerrar sesión
          </Button>

          <Button className={styles.cartBtn} onPress={() => setIsCartOpen(true)}>
            Carrito {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Button>
        </NavbarContent>
      </Navbar>

      <div className={styles.filters}>
        <input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
        <div className={styles.priceRange}>
          <input type="number" placeholder="Mín" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={styles.priceInput} />
          <span className={styles.separator}>—</span>
          <input type="number" placeholder="Máx" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={styles.priceInput} />
        </div>
        {(search || minPrice || maxPrice) && (
          <button onClick={clearFilters} className={styles.clearBtn}>
            Limpiar
          </button>
        )}
      </div>

      <h2 className={styles.subtitle}>Productos</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <Card key={product._id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image src={product.image} alt={product.name} fill className={styles.productImage} unoptimized={true} />
              </div>

              <CardBody className={styles.cardBody}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>${product.price.toLocaleString()}</p>

                <div className={styles.actions}>
                  <Button className={styles.edit} onPress={() => router.push(`/dashboard/products/edit/${product._id}`)}>
                    Editar
                  </Button>
                  <Button className={styles.delete} onPress={() => handleDelete(product._id)}>
                    Eliminar
                  </Button>
                  <Button className={styles.addToCart} onPress={() => addToCart(product)}>
                    + Carrito
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className={styles.pagination}>
        <Button isDisabled={page === 1} onPress={() => setPage(page - 1)}>Anterior</Button>
        <span>Página {page} de {totalPages}</span>
        <Button isDisabled={page === totalPages} onPress={() => setPage(page + 1)}>Siguiente</Button>
      </div>

      {isCartOpen && (
        <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
          <div className={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartHeader}>
              <h3>Tu Carrito ({totalItems} items)</h3>
              <Button className={styles.closeCart} onPress={() => setIsCartOpen(false)}>✕</Button>
            </div>

            <div className={styles.cartItems}>
              {cart.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>Tu carrito está vacío</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className={styles.cartItem}>
                    <Image src={item.image} alt={item.name} width={60} height={60} className={styles.cartItemImg} />
                    <div className={styles.cartItemInfo}>
                      <p className={styles.cartItemName}>{item.name}</p>
                      <p className={styles.cartItemPrice}>${item.price.toLocaleString()} c/u</p>
                    </div>
                    <div className={styles.cartItemActions}>
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeFromCart(item._id)} className={styles.removeItem}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className={styles.cartFooter}>
                <div className={styles.total}>
                  <strong>Total a pagar:</strong>
                  <strong className={styles.totalPrice}>${totalPrice.toLocaleString()}</strong>
                </div>
                <Button className={styles.checkoutBtn}>Ir a pagar</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}