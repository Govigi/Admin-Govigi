"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

export default function PaymentSettings() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Payment Settings States
    const [activeGateway, setActiveGateway] = useState("razorpay");
    const [razorpayKeyId, setRazorpayKeyId] = useState("");
    const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
    const [payuMerchantKey, setPayuMerchantKey] = useState("");
    const [payuMerchantSalt, setPayuMerchantSalt] = useState("");
    const [payuIsSandbox, setPayuIsSandbox] = useState(true);
    const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
    const [showPayuSalt, setShowPayuSalt] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axios.get(AdminUrl.getSettings.replace("{key}", "payment_settings"));
                if (res.data?.value) {
                    const val = res.data.value;
                    setActiveGateway(val.activeGateway || "razorpay");
                    setRazorpayKeyId(val.razorpay?.keyId || "");
                    setRazorpayKeySecret(val.razorpay?.keySecret || "");
                    setPayuMerchantKey(val.payu?.merchantKey || "");
                    setPayuMerchantSalt(val.payu?.merchantSalt || "");
                    setPayuIsSandbox(val.payu?.isSandbox ?? true);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSavePaymentSettings = async () => {
        setSaving(true);
        try {
            const payload = {
                activeGateway,
                razorpay: {
                    keyId: razorpayKeyId,
                    keySecret: razorpayKeySecret
                },
                payu: {
                    merchantKey: payuMerchantKey,
                    merchantSalt: payuMerchantSalt,
                    isSandbox: payuIsSandbox
                }
            };
            await axios.put(AdminUrl.updateSettings, {
                key: "payment_settings",
                value: payload
            });
            alert("Payment gateway settings saved successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save payment settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Payment Settings</h1>
                <p className="text-xs text-gray-400 mt-1">Configure Transaction Gateways & API Keys</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs uppercase tracking-widest text-gray-400">Loading Configuration...</div>
            ) : (
                <div className="max-w-7xl space-y-12">
                    {/* Payment Gateways Configuration */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] border-l-4 border-[#10b981] pl-3 font-mono">
                                Dynamic Transaction Providers
                            </h2>
                        </div>

                        {/* Interactive Selector */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Razorpay Option */}
                            <div 
                                onClick={() => setActiveGateway("razorpay")}
                                className={`cursor-pointer p-6 border-2 transition-all duration-300 flex flex-col justify-between h-36 ${
                                    activeGateway === "razorpay" 
                                        ? "border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]" 
                                        : "border-gray-200 hover:border-gray-400 bg-white text-gray-900"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Gateway 01</span>
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeGateway === "razorpay" ? "border-white" : "border-gray-300"}`}>
                                        {activeGateway === "razorpay" && <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wider font-mono">Razorpay</h3>
                                    <p className={`text-[10px] uppercase mt-1 ${activeGateway === "razorpay" ? "text-gray-400" : "text-gray-500"}`}>Cards, UPI, Netbanking, Wallets</p>
                                </div>
                            </div>

                            {/* PayU Option */}
                            <div 
                                onClick={() => setActiveGateway("payu")}
                                className={`cursor-pointer p-6 border-2 transition-all duration-300 flex flex-col justify-between h-36 ${
                                    activeGateway === "payu" 
                                        ? "border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]" 
                                        : "border-gray-200 hover:border-gray-400 bg-white text-gray-900"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Gateway 02</span>
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeGateway === "payu" ? "border-white" : "border-gray-300"}`}>
                                        {activeGateway === "payu" && <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wider font-mono">PayU India</h3>
                                    <p className={`text-[10px] uppercase mt-1 ${activeGateway === "payu" ? "text-gray-400" : "text-gray-500"}`}>Enterprise payments & express checkout</p>
                                </div>
                            </div>

                            {/* Both Option */}
                            <div 
                                onClick={() => setActiveGateway("both")}
                                className={`cursor-pointer p-6 border-2 transition-all duration-300 flex flex-col justify-between h-36 ${
                                    activeGateway === "both" 
                                        ? "border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]" 
                                        : "border-gray-200 hover:border-gray-400 bg-white text-gray-900"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Gateway 03</span>
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeGateway === "both" ? "border-white" : "border-gray-300"}`}>
                                        {activeGateway === "both" && <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wider font-mono">Dual Options</h3>
                                    <p className={`text-[10px] uppercase mt-1 ${activeGateway === "both" ? "text-gray-400" : "text-gray-500"}`}>Let customers select at checkout</p>
                                </div>
                            </div>
                        </div>

                        {/* Gateways Inputs Forms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                            {/* Razorpay Fields */}
                            <div className="border border-gray-100 p-6 bg-gray-50/50 space-y-6">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Razorpay Credentials</span>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-wider border border-blue-100 font-mono">UPI/Cards</span>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Key ID</label>
                                    <input 
                                        type="text"
                                        placeholder="rzp_test_..."
                                        value={razorpayKeyId}
                                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Key Secret</label>
                                    <div className="flex items-center border-b border-gray-300 focus-within:border-black transition-colors">
                                        <input 
                                            type={showRazorpaySecret ? "text" : "password"}
                                            placeholder="••••••••••••••••"
                                            value={razorpayKeySecret}
                                            onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                            className="block w-full bg-transparent py-2 px-0 text-sm focus:ring-0 focus:outline-none placeholder-gray-300"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                            className="text-gray-400 hover:text-black text-[10px] font-bold tracking-widest px-2 uppercase font-mono"
                                        >
                                            {showRazorpaySecret ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* PayU Fields */}
                            <div className="border border-gray-100 p-6 bg-gray-50/50 space-y-6">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">PayU Credentials</span>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-1 cursor-pointer text-[9px] uppercase tracking-wider font-bold text-gray-500 font-mono">
                                            <input 
                                                type="checkbox"
                                                checked={payuIsSandbox}
                                                onChange={(e) => setPayuIsSandbox(e.target.checked)}
                                                className="rounded-none border-gray-300 text-black focus:ring-0 focus:outline-none"
                                            />
                                            Sandbox
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Merchant Key</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter Merchant Key"
                                        value={payuMerchantKey}
                                        onChange={(e) => setPayuMerchantKey(e.target.value)}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Merchant Salt</label>
                                    <div className="flex items-center border-b border-gray-300 focus-within:border-black transition-colors">
                                        <input 
                                            type={showPayuSalt ? "text" : "password"}
                                            placeholder="••••••••••••••••"
                                            value={payuMerchantSalt}
                                            onChange={(e) => setPayuMerchantSalt(e.target.value)}
                                            className="block w-full bg-transparent py-2 px-0 text-sm focus:ring-0 focus:outline-none placeholder-gray-300"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPayuSalt(!showPayuSalt)}
                                            className="text-gray-400 hover:text-black text-[10px] font-bold tracking-widest px-2 uppercase font-mono"
                                        >
                                            {showPayuSalt ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSavePaymentSettings}
                                disabled={saving}
                                className="bg-black text-white px-10 py-3 text-xs uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-all font-mono font-bold shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] hover:shadow-none"
                            >
                                {saving ? "SAVING..." : "SAVE CONFIGURATION"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
