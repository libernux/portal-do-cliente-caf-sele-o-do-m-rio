import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, gradient, subtext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-5 rounded-full transform translate-x-10 -translate-y-10`} />
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#8B7355] mb-2">{title}</p>
              <p className="text-3xl font-bold text-[#6B4423] mb-1">{value}</p>
              {subtext && (
                <p className="text-xs text-[#8B7355]">{subtext}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${gradient} bg-opacity-15 shadow-sm`}>
              <Icon className="w-6 h-6 text-[#6B4423]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}