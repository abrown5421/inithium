import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import { cn } from "@inithium/utils";
import { AvatarProps } from "@inithium/types";

const RenderContent = ({ src, alt, initials, options }: Partial<AvatarProps>) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className="h-full w-full object-cover" 
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center font-bold",
        options?.font
      )}
      style={{ background: options?.gradient ?? "var(--fallback-gradient)" }}
    >
      {initials}
    </div>
  );
};

export const AvatarSurface = ({ src, alt, initials, options }: Partial<AvatarProps>) => 
  src ? (
    <img 
      src={src} 
      alt={alt} 
      className="h-full w-full object-cover" 
    />
  ) : (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center font-bold",
        options?.font
      )}
      style={{ background: options?.gradient ?? "var(--fallback-gradient)" }}
    >
      {initials}
    </div>
  );
  
export const Avatar: React.FC<AvatarProps> = ({
  src,
  initials,
  large = false,
  alt = "User avatar",
  options,
  onClick,
  className,
  ...props
}) => {
  const containerClasses = cn(
    "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden select-none",
    "aspect-square border-2 border-transparent", 
    large ? "h-32 w-32 text-2xl" : "h-12 w-12",
    options?.variant === "square" ? "rounded-md" : "rounded-full",
    onClick && "hover:opacity-80 transition-opacity cursor-pointer",
    className
  );

  const content = (
    <RenderContent 
      src={src} 
      alt={alt} 
      initials={initials} 
      options={options} 
    />
  );

  if (onClick) {
    return (
      <HeadlessButton
        {...props}
        as="div"
        role="button"
        tabIndex={0}
        onClick={onClick}
        className={containerClasses}
      >
        {content}
      </HeadlessButton>
    );
  }

  return (
    <div {...props} className={containerClasses}>
      {content}
    </div>
  );
};