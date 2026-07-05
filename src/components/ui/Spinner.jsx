import React from "react";
import { Loader2 } from "lucide-react";

const Spinner = ({ className = "" }) => {
  return <Loader2 className={`w-5 h-5 animate-spin ${className}`} />;
};

export default Spinner;
