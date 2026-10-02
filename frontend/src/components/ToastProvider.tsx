"use client";

import { ToastContainer } from "react-toastify";

// Bottom-left snackbar placement keeps toasts clear of the header navigation.
// No `limit`: queued toasts would delay Undo toasts past their 5-second delete window.
export default function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-left"
      autoClose={4000}
      pauseOnHover
      closeButton
      theme="light"
    />
  );
}
