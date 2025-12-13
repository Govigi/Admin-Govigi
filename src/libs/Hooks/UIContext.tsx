"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "info" | "confirm" | "delete";
type ToastType = "success" | "error" | "info" | "warning";

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface ToastState {
    isVisible: boolean;
    message: string;
    type: ToastType;
}

interface UIContextType {
    modal: ModalState;
    toast: ToastState;
    showModal: (
        title: string,
        message: string,
        type?: ModalType,
        onConfirm?: () => void,
        onCancel?: () => void,
        confirmText?: string,
        cancelText?: string
    ) => void;
    closeModal: () => void;
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const [toast, setToast] = useState<ToastState>({
        isVisible: false,
        message: "",
        type: "info",
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const showModal = (
        title: string,
        message: string,
        type: ModalType = "info",
        onConfirm?: () => void,
        onCancel?: () => void,
        confirmText: string = "Confirm",
        cancelText: string = "Cancel"
    ) => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            onCancel,
            confirmText,
            cancelText,
        });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const showToast = (message: string, type: ToastType = "info", duration: number = 3000) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, isVisible: false }));
        }, duration);
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    };

    return (
        <UIContext.Provider
            value={{
                modal,
                toast,
                showModal,
                closeModal,
                showToast,
                hideToast,
                isMobileMenuOpen,
                toggleMobileMenu,
                closeMobileMenu
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
}
