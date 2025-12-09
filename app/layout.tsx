"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Slide } from "react-toastify";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          pauseOnFocusLoss
          transition={Slide}
          theme="colored"
        />
        </SessionProvider>
      </body>
    </html>
  );
}
