import React from 'react';
import { Card } from '@/components/ui/card';

export function RightColumn() {
  return (
    <div className="grid grid-rows-2 gap-4 h-full">
      {/* Testimonials */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222]">
      </Card>

      {/* Workflow Highlights */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222]">
      </Card>
    </div>
  );
}
