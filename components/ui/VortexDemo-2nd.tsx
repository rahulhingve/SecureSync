import React from "react";
import { Vortex } from "../ui/Vortex-2nd";





export function VortexDemoSecond({className}:{ className?: string}) {
  return (
    <div className={className}>
      <Vortex
        backgroundColor="black"
        
        // className={className}
      >
       
      </Vortex>
    </div>
  );
}

