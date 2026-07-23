"use client";

import { motion } from "framer-motion";
import { Truck, Clock, MapPin, Package } from "lucide-react";

interface DeliveryInfoProps {
  shipsWithin?: string;
  panIndia?: boolean;
  bulkOrders?: boolean;
  stockCount: number;
}

export function DeliveryInfo({
  shipsWithin = "24 Hours",
  panIndia = true,
  bulkOrders = true,
  stockCount,
}: DeliveryInfoProps) {
  const items = [
    {
      icon: Clock,
      label: `Ships within ${shipsWithin}`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: MapPin,
      label: "PAN India Delivery",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Package,
      label: `${stockCount.toLocaleString()} units in stock`,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
  ];

  if (bulkOrders) {
    items.push({
      icon: Truck,
      label: "Bulk Orders Available",
      color: "text-purple-600",
      bg: "bg-purple-50",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-2"
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-2 p-2.5 rounded-xl ${item.bg} border border-transparent`}
          >
            <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
            </div>
            <span className="text-[11px] font-medium text-zinc-700 leading-tight">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}