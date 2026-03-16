import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-transparent text-white bg-gradient-to-r from-accent1 to-accent2 hover:opacity-90 focus:ring-accent1",
    secondary: "border-transparent text-white bg-secondary hover:bg-gray-700 focus:ring-gray-500",
    outline: "border-gray-300 text-primary bg-white hover:bg-gray-50 focus:ring-accent1",
    ghost: "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-none"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;