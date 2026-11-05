import React from "react";

const orderStages = [
    "Confirmed",
    "Preparing",
    "Ready for Pickup",
    "Out for Delivery",
    "Delivered"
];

const OrderStatusTimeline = ({ status, deliveryIssue }) => {
    if (status === "Cancelled") {
        return (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                    Order Cancelled
                </p>
                <p className="mt-1 text-sm text-red-600">
                    This order is no longer being processed.
                </p>
            </div>
        );
    }

    const displayStatus =
        status === "Delivery Failed" ? "Out for Delivery" : status;

    const currentIndex = orderStages.indexOf(displayStatus);

    return (
        <div className="mt-6">
            <h3 className="mb-5 font-semibold text-gray-900">
                Order Progress
            </h3>

            <div className="space-y-4">
                {orderStages.map((stage, index) => {
                    const completed =
                        currentIndex >= 0 && index <= currentIndex;

                    const current = index === currentIndex;

                    return (
                        <div key={stage} className="flex items-start gap-3">
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                    completed
                                        ? status === "Delivery Failed" &&
                                          stage === "Out for Delivery"
                                            ? "bg-red-600 text-white"
                                            : "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {completed && status !== "Delivery Failed"
                                    ? "✓"
                                    : index + 1}
                            </div>

                            <div className="flex-1">
                                <p
                                    className={`font-medium ${
                                        current
                                            ? status === "Delivery Failed"
                                                ? "text-red-600"
                                                : "text-orange-600"
                                            : completed
                                                ? "text-gray-900"
                                                : "text-gray-500"
                                    }`}
                                >
                                    {stage}
                                </p>

                                {current && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {status === "Delivery Failed"
                                            ? "Delivery issue reported"
                                            : "Current order status"}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {status === "Delivery Failed" && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <h4 className="font-semibold text-red-700">
                        Delivery issue reported
                    </h4>

                    <p className="mt-2 text-sm text-red-700">
                        {deliveryIssue?.reason ||
                            "The delivery partner reported a problem."}
                    </p>

                    <p className="mt-2 text-xs text-red-600">
                        Issue status: {deliveryIssue?.status || "Open"}
                    </p>
                </div>
            )}

            {status === "Out for Delivery" &&
                deliveryIssue?.status === "Retrying" && (
                    <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <h4 className="font-semibold text-orange-800">
                            Delivery retry in progress
                        </h4>

                        <p className="mt-2 text-sm text-orange-800">
                            Previous issue: {deliveryIssue.reason}
                        </p>
                    </div>
                )}
        </div>
    );
};

export default OrderStatusTimeline;