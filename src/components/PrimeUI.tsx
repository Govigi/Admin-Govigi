import React from "react";

// 1. PrimeCard: Rounded card container with soft shadow and subtle border
export const PrimeCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

// 2. PrimeInput: Standard text/number input field with green focus ring
export const PrimeInput = ({
    label,
    value,
    onChange,
    name,
    type = "text",
    required = false,
    disabled = false,
    placeholder,
    className = ""
}: {
    label?: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
            <label className="text-xs font-bold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <input
            type={type}
            name={name}
            required={required}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder || (label ? `Enter ${label.toLowerCase()}` : "")}
            className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 focus:border-[#10b981] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        />
    </div>
);

// 3. PrimeSelect: Dropdown selector component
export const PrimeSelect = ({
    label,
    value,
    onChange,
    name,
    options,
    disabled = false,
    className = ""
}: {
    label?: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    options: { value: string | number; label: string }[];
    disabled?: boolean;
    className?: string;
}) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && <label className="text-xs font-bold text-gray-700">{label}</label>}
        <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 focus:border-[#10b981] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat pr-10 cursor-pointer"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

// 4. PrimeSwitch: Clean toggle switch using the sidebar color
export const PrimeSwitch = ({
    checked,
    onChange,
    disabled = false
}: {
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
}) => (
    <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${checked ? "bg-[#10b981]" : "bg-gray-300"}`}
    >
        <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                checked ? "translate-x-4.5" : "translate-x-1"
            }`}
        />
    </button>
);

// 5. PrimeBadge: Status indicator badge with pre-configured themes
export const PrimeBadge = ({
    value,
    severity = "info"
}: {
    value: string;
    severity?: "success" | "warning" | "danger" | "info" | "neutral";
}) => {
    const styleMap = {
        success: "bg-emerald-50 text-[#059669] border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-red-50 text-red-700 border-red-200",
        info: "bg-blue-50 text-blue-700 border-blue-200",
        neutral: "bg-gray-50 text-gray-600 border-gray-200"
    };

    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${styleMap[severity]}`}>
            {value}
        </span>
    );
};

// 6. PrimeButton: Reusable button matching sidebar colors
export const PrimeButton = ({
    children,
    onClick,
    type = "button",
    severity = "primary",
    disabled = false,
    className = ""
}: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    severity?: "primary" | "secondary" | "danger" | "success";
    disabled?: boolean;
    className?: string;
}) => {
    const severityMap = {
        primary: "bg-[#10b981] hover:bg-[#059669] text-white shadow-sm border border-transparent",
        secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm",
        success: "bg-[#059669] hover:bg-emerald-700 text-white shadow-sm border border-transparent",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${severityMap[severity]} ${className}`}
        >
            {children}
        </button>
    );
};

// 7. PrimeDetailRow: View mode clean detail visual row
export const PrimeDetailRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-gray-800 mt-0.5">{value || "—"}</span>
    </div>
);
