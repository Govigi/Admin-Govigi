import { ArrowRightIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/16/solid";

export default function DeliverySettings() {
    return (
        <div className="p-4">
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-950">Delivery Rates</h3>
                            <p className="text-sm text-gray-600">Configure delivery charges based on distance and weight</p>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md">
                            <PlusIcon className="h-5 w-5" />
                            Add Rate
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { min: 0, max: 5, rate: 60 },
                            { min: 5, max: 10, rate: 100 },
                            { min: 10, max: 20, rate: 150 }
                        ].map((rate, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">{rate.min} km</span>
                                        <ArrowRightIcon className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{rate.max} km</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-px bg-gray-300"></div>
                                        <span className="text-sm font-medium text-gray-950">Rs. {rate.rate}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-blue-600 hover:text-blue-700">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-700">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-950">Delivery Zones</h3>
                            <p className="text-sm text-gray-600">Define delivery zones and associated charges</p>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md">
                            <PlusIcon className="h-5 w-5" />
                            Add Zone
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-950">Delivery Partner Settings</h3>
                            <p className="text-sm text-gray-600">Configure settings for delivery partners</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: "Minimum Delivery Fee", value: 60 },
                            { label: "Per KM Rate", value: 15 },
                            { label: "Free Delivery Threshold", value: 2000 },
                            { label: "Delivery Radius (km)", value: 10 }
                        ].map((setting, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={setting.value}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <span className="text-sm text-gray-600">Rs.</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}