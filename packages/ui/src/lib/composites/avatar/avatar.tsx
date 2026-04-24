import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import { cn } from "@inithium/utils";
import { AvatarProps, SIZE_MAP } from "@inithium/types";

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

const AvatarSurface = ({ src, alt, initials, options }: Partial<AvatarProps>) => 
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
  size = "md",
  alt = "User avatar",
  options,
  onClick,
  className,
  ...props
}) => {
  const containerClasses = cn(
    "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden select-none",
    "aspect-square border-2 border-transparent", 
    SIZE_MAP[size],
    options?.variant === "square" ? "rounded-md" : "rounded-full",
    onClick && "hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2",
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