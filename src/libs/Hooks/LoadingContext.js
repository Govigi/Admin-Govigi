"use client"

import { useContext, createContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({children}) => {
    const [isLoading,setIsLoading] = useState(false);
    const [message,setMessage] = useState("");

    const showLoader = (msg = "") => {
        setMessage(msg);
        setIsLoading(true);
    }

    const hideLoader = () => {
        setMessage("");
        setIsLoading(false);
    }

    return(
        <LoadingContext.Provider value={{isLoading,message,showLoader,hideLoader}}>
            {children}
        </LoadingContext.Provider>
    );

};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};