"use client"
import React, { createContext, useContext, useState } from "react";

interface ModalContextType {
  isModalOpen: boolean;
  productId: number | null;
  openModal: (id: number) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);

  const openModal = (id: number) => {
    setProductId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProductId(null);
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, productId, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}; 