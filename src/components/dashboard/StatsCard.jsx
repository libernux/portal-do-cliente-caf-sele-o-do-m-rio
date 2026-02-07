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
      <Card className="relative overflow-hidden border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-700">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-5 rounded-full transform translate-x-10 -translate-y-10`} />
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-[#8B7355] dark:text-gray-400 mb-1 sm:mb-2 truncate">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-1 truncate">{value}</p>
              {subtext && (
                <p className="text-[10px] sm:text-xs text-[#8B7355] dark:text-gray-400 truncate">{subtext}</p>
              )}
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${gradient} bg-opacity-15 shadow-sm flex-shrink-0`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B4423] dark:text-[#C9A961]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}