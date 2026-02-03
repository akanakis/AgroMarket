import React from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Order } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface BuyerOrderTrackerProps {
    orders: Order[];
}

const steps = [
    { status: 'Pending', label: 'Order Placed', icon: Clock },
    { status: 'Processing', label: 'Processing', icon: Package },
    { status: 'Shipped', label: 'In Transit', icon: Truck },
    { status: 'Completed', label: 'Delivered', icon: CheckCircle },
];

export default function BuyerOrderTracker({ orders }: BuyerOrderTrackerProps) {
    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-800">No orders yet</h3>
                <p className="text-stone-500">Start exploring the marketplace!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-800">My Orders</h2>
            {orders.map((order) => {
                const currentStepIndex = steps.findIndex(s => s.status === order.status) || 0;
                // If status is not in generic steps (e.g. Cancelled), handle smoothly. 
                // For simplified demo, assume standard flow or map clearly.
                const isCancelled = order.status === 'Cancelled';

                return (
                    <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-stone-50 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <p className="text-sm text-stone-500">Order #{order.id}</p>
                                <p className="text-sm text-stone-500 font-medium">
                                    Placed on {order.date ? format(new Date(order.date), 'PPP') : 'Unknown Date'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-stone-800">${order.total.toFixed(2)}</p>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase inline-block mt-1",
                                    isCancelled ? "bg-red-100 text-red-700" :
                                        order.status === 'Completed' ? "bg-green-100 text-green-700" :
                                            "bg-blue-100 text-blue-700"
                                )}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {!isCancelled && (
                            <div className="p-8">
                                <div className="relative">
                                    {/* Progress Bar Background */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full" />

                                    {/* Active Progress Bar */}
                                    <div
                                        className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-500"
                                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                    />

                                    {/* Steps */}
                                    <div className="relative flex justify-between">
                                        {steps.map((step, index) => {
                                            const Icon = step.icon;
                                            const isActive = index <= currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div key={step.label} className="flex flex-col items-center gap-2">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 bg-white",
                                                        isActive
                                                            ? "border-green-500 text-green-500"
                                                            : "border-stone-200 text-stone-300",
                                                        isCurrent && "ring-4 ring-green-100"
                                                    )}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-medium transition-colors",
                                                        isActive ? "text-stone-800" : "text-stone-400"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Items Mock View (since we only have summary) */}
                        <div className="p-6 bg-stone-50/50">
                            <p className="text-sm text-stone-500 italic">
                                Order details available in invoice...
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
