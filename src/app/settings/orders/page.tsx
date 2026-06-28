"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

export default function OrderSettings() {
    const [orderBooking, setOrderBooking] = useState<any>({
        minimumOrderAmount: 499,
        minimumOrderEnabled: true,
        maxCodAmount: 2000,
        codThresholdEnabled: true,
        defaultDeliveryFee: 50,
        firstOrdersPromo: {
            enabled: true,
            limitCount: 3,
            bannerText: "First 3 deliveries are completely FREE!"
        },
        thresholdPromo: {
            enabled: true,
            minAmount: 499,
            bannerText: "Get FREE delivery on orders over ₹499"
        }
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axios.get(AdminUrl.getOrderBookingSettings);
                if (res.data) {
                    setOrderBooking((prev: any) => ({
                        ...prev,
                        ...res.data,
                        firstOrdersPromo: {
                            ...prev.firstOrdersPromo,
                            ...(res.data.firstOrdersPromo || {})
                        },
                        thresholdPromo: {
                            ...prev.thresholdPromo,
                            ...(res.data.thresholdPromo || {})
                        }
                    }));
                }
            } catch (error) {
                console.error("Error loading order settings:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSaveOrderBooking = async () => {
        setSaving(true);
        try {
            await axios.put(AdminUrl.updateOrderBookingSettings, {
                minimumOrderAmount: orderBooking.minimumOrderAmount,
                minimumOrderEnabled: orderBooking.minimumOrderEnabled,
                maxCodAmount: orderBooking.maxCodAmount,
                codThresholdEnabled: orderBooking.codThresholdEnabled
            });
            alert("Order booking settings saved!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDeliveryPromotions = async () => {
        setSaving(true);
        try {
            await axios.put(AdminUrl.updateDeliverySettings, {
                options: {
                    firstOrdersPromo: orderBooking.firstOrdersPromo,
                    thresholdPromo: orderBooking.thresholdPromo,
                    defaultDeliveryFee: orderBooking.defaultDeliveryFee
                }
            });
            alert("Delivery promotions settings saved!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Order Settings</h1>
                <p className="text-xs text-gray-400 mt-1">Configure Minimum order limits, COD thresholds, and Delivery promotions</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs uppercase tracking-widest text-gray-400">Loading Configuration...</div>
            ) : (
                <div className="max-w-7xl space-y-12">

                    {/* 1. Order Booking & COD Configuration */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                            01. Order Booking & COD Configuration
                        </h2>
                        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Minimum Order */}
                            <div className="border border-gray-200 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Minimum Order Placement</span>
                                    <button
                                        onClick={() => setOrderBooking({ ...orderBooking, minimumOrderEnabled: !orderBooking.minimumOrderEnabled })}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border transition-all duration-200 ${orderBooking.minimumOrderEnabled ? 'bg-black text-[#10b981] border-[#10b981]' : 'bg-transparent text-gray-400 border-gray-200'}`}
                                    >
                                        {orderBooking.minimumOrderEnabled ? "ENABLED" : "DISABLED"}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Minimum Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={orderBooking.minimumOrderAmount ?? ""}
                                        onChange={(e) => setOrderBooking({ ...orderBooking, minimumOrderAmount: Number(e.target.value) })}
                                        disabled={!orderBooking.minimumOrderEnabled}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* COD Threshold */}
                            <div className="border border-gray-200 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">COD Threshold Limit</span>
                                    <button
                                        onClick={() => setOrderBooking({ ...orderBooking, codThresholdEnabled: !orderBooking.codThresholdEnabled })}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border transition-all duration-200 ${orderBooking.codThresholdEnabled ? 'bg-black text-[#10b981] border-[#10b981]' : 'bg-transparent text-gray-400 border-gray-200'}`}
                                    >
                                        {orderBooking.codThresholdEnabled ? "ENABLED" : "DISABLED"}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Maximum COD Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={orderBooking.maxCodAmount ?? ""}
                                        onChange={(e) => setOrderBooking({ ...orderBooking, maxCodAmount: Number(e.target.value) })}
                                        disabled={!orderBooking.codThresholdEnabled}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end max-w-4xl">
                            <button
                                onClick={handleSaveOrderBooking}
                                disabled={saving}
                                className="bg-black text-white px-8 py-2 text-xs uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-colors h-[38px]"
                            >
                                {saving ? "SAVING..." : "SAVE ORDER BOOKING SETTINGS"}
                            </button>
                        </div>
                    </div>

                    {/* 2. Delivery & Promotions Configuration */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                            02. Delivery & Promotions Configuration
                        </h2>
                        <div className="max-w-4xl space-y-6">
                            {/* Default Delivery Fee */}
                            <div className="border border-gray-200 p-4">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Default Delivery Fee (₹)</label>
                                <input
                                    type="number"
                                    value={orderBooking.defaultDeliveryFee ?? ""}
                                    onChange={(e) => setOrderBooking({ ...orderBooking, defaultDeliveryFee: Number(e.target.value) })}
                                    className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* First N Free Deliveries */}
                                <div className="border border-gray-200 p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">First N Free Deliveries</span>
                                        <button
                                            onClick={() => setOrderBooking({
                                                ...orderBooking,
                                                firstOrdersPromo: {
                                                    ...orderBooking.firstOrdersPromo,
                                                    enabled: !orderBooking.firstOrdersPromo?.enabled
                                                }
                                            })}
                                            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border transition-all duration-200 ${orderBooking.firstOrdersPromo?.enabled ? 'bg-black text-[#10b981] border-[#10b981]' : 'bg-transparent text-gray-400 border-gray-200'}`}
                                        >
                                            {orderBooking.firstOrdersPromo?.enabled ? "ENABLED" : "DISABLED"}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Free Delivery Limit Count</label>
                                            <input
                                                type="number"
                                                value={orderBooking.firstOrdersPromo?.limitCount ?? ""}
                                                onChange={(e) => setOrderBooking({
                                                    ...orderBooking,
                                                    firstOrdersPromo: {
                                                        ...orderBooking.firstOrdersPromo,
                                                        limitCount: Number(e.target.value)
                                                    }
                                                })}
                                                disabled={!orderBooking.firstOrdersPromo?.enabled}
                                                className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Promo Banner Text</label>
                                            <input
                                                type="text"
                                                value={orderBooking.firstOrdersPromo?.bannerText ?? ""}
                                                onChange={(e) => setOrderBooking({
                                                    ...orderBooking,
                                                    firstOrdersPromo: {
                                                        ...orderBooking.firstOrdersPromo,
                                                        bannerText: e.target.value
                                                    }
                                                })}
                                                disabled={!orderBooking.firstOrdersPromo?.enabled}
                                                className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Free Delivery Threshold */}
                                <div className="border border-gray-200 p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Price Threshold Free Delivery</span>
                                        <button
                                            onClick={() => setOrderBooking({
                                                ...orderBooking,
                                                thresholdPromo: {
                                                    ...orderBooking.thresholdPromo,
                                                    enabled: !orderBooking.thresholdPromo?.enabled
                                                }
                                            })}
                                            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border transition-all duration-200 ${orderBooking.thresholdPromo?.enabled ? 'bg-black text-[#10b981] border-[#10b981]' : 'bg-transparent text-gray-400 border-gray-200'}`}
                                        >
                                            {orderBooking.thresholdPromo?.enabled ? "ENABLED" : "DISABLED"}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Threshold Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={orderBooking.thresholdPromo?.minAmount ?? ""}
                                                onChange={(e) => setOrderBooking({
                                                    ...orderBooking,
                                                    thresholdPromo: {
                                                        ...orderBooking.thresholdPromo,
                                                        minAmount: Number(e.target.value)
                                                    }
                                                })}
                                                disabled={!orderBooking.thresholdPromo?.enabled}
                                                className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Promo Banner Text</label>
                                            <input
                                                type="text"
                                                value={orderBooking.thresholdPromo?.bannerText ?? ""}
                                                onChange={(e) => setOrderBooking({
                                                    ...orderBooking,
                                                    thresholdPromo: {
                                                        ...orderBooking.thresholdPromo,
                                                        bannerText: e.target.value
                                                    }
                                                })}
                                                disabled={!orderBooking.thresholdPromo?.enabled}
                                                className="block w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end max-w-4xl">
                            <button
                                onClick={handleSaveDeliveryPromotions}
                                disabled={saving}
                                className="bg-black text-white px-8 py-2 text-xs uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-colors h-[38px]"
                            >
                                {saving ? "SAVING..." : "SAVE DELIVERY CONFIGURATION"}
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
