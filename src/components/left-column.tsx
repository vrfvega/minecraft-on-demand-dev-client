import React from 'react';
import { Card } from '@/components/ui/card';

export function LeftColumn() {
  return (
    <div className="grid grid-rows-3 gap-4 h-full">
      {/* Tech Arsenal Section */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222] h-full min-h-[250px]">
      </Card>

      {/* Works Gallery */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222] h-full min-h-[250px]">
      </Card>

      {/* Solutions Suite */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222] h-full min-h-[250px]">
      </Card>
    </div>
  );
}
