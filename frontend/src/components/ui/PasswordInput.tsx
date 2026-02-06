"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...props} // Hereda todas las propiedades (onChange, value, required...)
        type={showPassword ? "text" : "password"}
        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none pr-10 ${props.className}`}
      />
      <button
        type="button" // Importante para que no envíe el formulario
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}