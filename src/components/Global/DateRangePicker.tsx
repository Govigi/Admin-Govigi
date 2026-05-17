"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface DateRangePickerProps {
    startDate: string | null;
    endDate: string | null;
    onChange: (start: string | null, end: string | null) => void;
    dateFilterType?: "orderDate" | "deliveryDate";
    onFilterTypeChange?: (type: "orderDate" | "deliveryDate") => void;
    showFilterTypeToggle?: boolean;
}

export default function DateRangePicker({
    startDate,
    endDate,
    onChange,
    dateFilterType = "orderDate",
    onFilterTypeChange,
    showFilterTypeToggle = true,
}: DateRangePickerProps) {
    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [leftMonth, setLeftMonth] = useState(new Date());

    const rightMonth = useMemo(() => {
        return new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);
    }, [leftMonth]);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (!calendarOpen) return;
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".date-range-picker-container")) {
                setCalendarOpen(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [calendarOpen]);

    // Calendar Handlers
    const handlePrevMonth = () => {
        setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1));
    };

    const handleLeftMonthChange = (newMonth: number) => {
        setLeftMonth(new Date(leftMonth.getFullYear(), newMonth, 1));
    };

    const handleLeftYearChange = (newYear: number) => {
        setLeftMonth(new Date(newYear, leftMonth.getMonth(), 1));
    };

    const handleRightMonthChange = (newMonth: number) => {
        setLeftMonth(new Date(leftMonth.getFullYear(), newMonth - 1, 1));
    };

    const handleRightYearChange = (newYear: number) => {
        setLeftMonth(new Date(newYear, leftMonth.getMonth(), 1));
    };

    const handleDayMouseEnter = (dateString: string) => {
        if (startDate && !endDate) {
            setHoverDate(dateString);
        }
    };

    const handleDayClick = (dateString: string) => {
        if (!startDate || (startDate && endDate)) {
            onChange(dateString, null);
            setHoverDate(null);
        } else {
            if (new Date(dateString) < new Date(startDate)) {
                onChange(dateString, startDate);
            } else {
                onChange(startDate, dateString);
            }
            setHoverDate(null);
        }
    };

    // Date Presets
    const formatDateString = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const setRangeToday = () => {
        const todayStr = getTodayDate();
        onChange(todayStr, todayStr);
        setHoverDate(null);
    };

    const setRangeYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = formatDateString(yesterday);
        onChange(yStr, yStr);
        setHoverDate(null);
    };

    const setRangeThisWeek = () => {
        const today = new Date();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        onChange(formatDateString(firstDayOfWeek), formatDateString(today));
        setHoverDate(null);
    };

    const setRangeLastWeek = () => {
        const today = new Date();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(today);
        endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
        onChange(formatDateString(startOfLastWeek), formatDateString(endOfLastWeek));
        setHoverDate(null);
    };

    const setRangeThisMonth = () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        onChange(formatDateString(startOfMonth), formatDateString(today));
        setHoverDate(null);
    };

    const setRangeLastMonth = () => {
        const today = new Date();
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        onChange(formatDateString(startOfLastMonth), formatDateString(endOfLastMonth));
        setHoverDate(null);
    };

    const setRangeAllTime = () => {
        onChange(null, null);
        setHoverDate(null);
    };

    const formatDateDisplay = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }).toUpperCase();
    };

    const formatFullDateDisplay = (dateStr: string | null) => {
        if (!dateStr) return "SELECT DATE";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
    };

    const getCalendarDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayIdx = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        const days = [];

        for (let i = firstDayIdx - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const prevMonthDate = new Date(year, month - 1, d);
            days.push({
                day: d,
                dateString: formatDateString(prevMonthDate),
                isCurrentMonth: false,
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const currentMonthDate = new Date(year, month, d);
            days.push({
                day: d,
                dateString: formatDateString(currentMonthDate),
                isCurrentMonth: true,
            });
        }

        const nextMonthPaddingCount = 42 - days.length;
        for (let d = 1; d <= nextMonthPaddingCount; d++) {
            const nextMonthDate = new Date(year, month + 1, d);
            days.push({
                day: d,
                dateString: formatDateString(nextMonthDate),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const renderPaneDays = (paneDate: Date) => {
        const days = getCalendarDays(paneDate);

        return days.map(({ day, dateString, isCurrentMonth }, idx) => {
            const isSelectedStart = startDate === dateString;
            const isSelectedEnd = endDate === dateString;

            let isWithinRange = false;
            if (startDate && endDate) {
                isWithinRange =
                    new Date(dateString) > new Date(startDate) &&
                    new Date(dateString) < new Date(endDate);
            } else if (startDate && hoverDate) {
                const start = new Date(startDate);
                const hover = new Date(hoverDate);
                const current = new Date(dateString);

                if (hover >= start) {
                    isWithinRange = current > start && current < hover;
                } else {
                    isWithinRange = current > hover && current < start;
                }
            }

            let cellClass = "py-0.5 relative flex items-center justify-center w-full ";
            if (isWithinRange) {
                cellClass += "bg-emerald-500";
            }

            let dayBtnClass = "h-8 w-8 flex items-center justify-center font-bold text-[10px] transition-colors relative z-10 font-mono ";
            if (isSelectedStart || isSelectedEnd) {
                dayBtnClass += "bg-[#10b981] text-white rounded-full shadow-sm";
            } else if (isWithinRange) {
                dayBtnClass += "text-white hover:bg-emerald-600 rounded-full cursor-pointer";
            } else if (isCurrentMonth) {
                dayBtnClass += "text-gray-900 hover:bg-gray-200 rounded-full cursor-pointer";
            } else {
                dayBtnClass += "text-gray-350 hover:bg-gray-100 rounded-full cursor-pointer";
            }

            const isToday = dateString === getTodayDate();
            if (isToday && !isSelectedStart && !isSelectedEnd) {
                dayBtnClass += " border border-[#10b981]";
            }

            return (
                <div
                    key={idx}
                    className={cellClass}
                    onClick={() => handleDayClick(dateString)}
                    onMouseEnter={() => handleDayMouseEnter(dateString)}
                >
                    <span className={dayBtnClass}>
                        {day}
                    </span>
                </div>
            );
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto date-range-picker-container">
            {/* View Mode Toggle Segment */}
            {showFilterTypeToggle && onFilterTypeChange && (
                <div className="flex bg-gray-50 p-1 border border-gray-200 shadow-sm shrink-0">
                    <button
                        onClick={() => onFilterTypeChange("orderDate")}
                        className={`px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${
                            dateFilterType === "orderDate"
                                ? "bg-gray-950 text-white"
                                : "text-gray-500 hover:text-black"
                        }`}
                    >
                        Order Date
                    </button>
                    <button
                        onClick={() => onFilterTypeChange("deliveryDate")}
                        className={`px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${
                            dateFilterType === "deliveryDate"
                                ? "bg-gray-950 text-white"
                                : "text-gray-500 hover:text-black"
                        }`}
                    >
                        Delivery Date
                    </button>
                </div>
            )}

            {/* Dual-Pane Custom Dropdown Date Range Picker */}
            <div className="relative">
                <button
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-none px-4 py-2 shadow-sm hover:border-black transition-all shrink-0 text-xs font-bold font-mono text-gray-800"
                >
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="uppercase tracking-wider">
                        {startDate
                            ? endDate
                                ? startDate === endDate
                                    ? formatDateDisplay(startDate)
                                    : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
                                : `${formatDateDisplay(startDate)} - ...`
                            : "ALL TIME"}
                    </span>
                </button>

                {calendarOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-none p-0 z-50 w-full md:w-[680px] font-sans text-gray-900 flex flex-col md:flex-row overflow-hidden">
                        {/* Calendars Container (Left) */}
                        <div className="flex-1 p-4 border-r border-gray-200">
                            {/* Top Range Header */}
                            <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-gray-200 text-xs font-bold tracking-wide text-gray-700">
                                <span className={startDate ? "text-gray-950 font-extrabold" : "text-gray-400"}>
                                    {formatFullDateDisplay(startDate)}
                                </span>
                                <span className="text-gray-400 font-bold">&rarr;</span>
                                <span className={endDate ? "text-gray-950 font-extrabold" : "text-gray-400"}>
                                    {formatFullDateDisplay(endDate)}
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* LEFT CALENDAR */}
                                <div className="flex-1">
                                    {/* Calendar Header with Navigation & Selects */}
                                    <div className="flex justify-between items-center mb-4">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors rounded-none"
                                        >
                                            &lt;
                                        </button>
                                        <div className="flex gap-2 text-[10px] font-bold font-sans">
                                            <select
                                                value={leftMonth.getMonth()}
                                                onChange={(e) => handleLeftMonthChange(Number(e.target.value))}
                                                className="bg-transparent border-b border-gray-200 focus:outline-none focus:border-black py-0.5 font-bold cursor-pointer font-sans uppercase"
                                            >
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option key={i} value={i}>
                                                        {new Date(2000, i, 1).toLocaleString("en-US", { month: "short" })}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={leftMonth.getFullYear()}
                                                onChange={(e) => handleLeftYearChange(Number(e.target.value))}
                                                className="bg-transparent border-b border-gray-200 focus:outline-none focus:border-black py-0.5 font-bold cursor-pointer font-sans"
                                            >
                                                {Array.from({ length: 15 }).map((_, i) => {
                                                    const y = new Date().getFullYear() - 5 + i;
                                                    return <option key={y} value={y}>{y}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="w-6" /> {/* Placeholder spacing */}
                                    </div>

                                    {/* Left Calendar Days grid */}
                                    <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-bold text-gray-400 mb-2 font-sans border-b border-gray-100 pb-1">
                                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-sans">
                                        {renderPaneDays(leftMonth)}
                                    </div>
                                </div>

                                {/* RIGHT CALENDAR */}
                                <div className="flex-1">
                                    {/* Calendar Header with Navigation & Selects */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="w-6" /> {/* Placeholder spacing */}
                                        <div className="flex gap-2 text-[10px] font-bold font-sans">
                                            <select
                                                value={rightMonth.getMonth()}
                                                onChange={(e) => handleRightMonthChange(Number(e.target.value))}
                                                className="bg-transparent border-b border-gray-200 focus:outline-none focus:border-black py-0.5 font-bold cursor-pointer font-sans uppercase"
                                            >
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option key={i} value={i}>
                                                        {new Date(2000, i, 1).toLocaleString("en-US", { month: "short" })}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={rightMonth.getFullYear()}
                                                onChange={(e) => handleRightYearChange(Number(e.target.value))}
                                                className="bg-transparent border-b border-gray-200 focus:outline-none focus:border-black py-0.5 font-bold cursor-pointer font-sans"
                                            >
                                                {Array.from({ length: 15 }).map((_, i) => {
                                                    const y = new Date().getFullYear() - 5 + i;
                                                    return <option key={y} value={y}>{y}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors rounded-none"
                                        >
                                            &gt;
                                        </button>
                                    </div>

                                    {/* Right Calendar Days grid */}
                                    <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-bold text-gray-400 mb-2 font-sans border-b border-gray-100 pb-1">
                                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-sans">
                                        {renderPaneDays(rightMonth)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Presets Sidebar (Right) */}
                        <div className="w-full md:w-36 bg-gray-50 p-4 flex flex-col gap-3 font-sans border-t md:border-t-0 md:border-l border-gray-200">
                            <button onClick={setRangeToday} className="text-left text-[10px] font-bold text-gray-700 hover:text-[#10b981] transition-colors uppercase tracking-wider">Today</button>
                            <button onClick={setRangeYesterday} className="text-left text-[10px] font-bold text-gray-700 hover:text-[#10b981] transition-colors uppercase tracking-wider">Yesterday</button>
                            <button onClick={setRangeThisWeek} className="text-left text-[10px] font-bold text-gray-700 hover:text-[#10b981] transition-colors uppercase tracking-wider">This Week</button>
                            <button onClick={setRangeLastWeek} className="text-left text-[10px] font-bold text-gray-700 hover:text-[#10b981] transition-colors uppercase tracking-wider">Last Week</button>
                            <button onClick={setRangeThisMonth} className="text-left text-[10px] font-bold text-gray-700 hover:text-[#10b981] transition-colors uppercase tracking-wider">This Month</button>
                            <button onClick={setRangeLastMonth} className="text-left text-[10px] font-bold text-gray-700 hover:text-[#10b981] transition-colors uppercase tracking-wider">Last Month</button>
                            <div className="flex-1" />
                            <button onClick={setRangeAllTime} className="text-left text-[10px] font-extrabold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider mt-4">Clear All</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
