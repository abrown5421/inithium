import React from "react";
import { Avatar } from "../avatar/avatar";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";

interface UserSlotProps {
  isAuthenticated: boolean;
  user?: {
    src?: string;
    initials?: string;
    gradient?: string;
  };
  onAvatarClick: () => void;
  onHamburgerClick: () => void;
  onLoginClick: () => void;
}

export const UserSlot: React.FC<UserSlotProps> = ({
  isAuthenticated,
  user,
  onAvatarClick,
  onHamburgerClick,
  onLoginClick,
}) => {
  if (isAuthenticated) {
    return (
      <Avatar
        src={user?.src}
        initials={user?.initials}
        size="sm"
        options={{ gradient: user?.gradient }}
        onClick={onAvatarClick}
      />
    );
  }

  return (
    <>
      <button
        onClick={onHamburgerClick}
        aria-label="Open navigation menu"
        className="flex lg:hidden items-center justify-center rounded-md p-1.5 text-on-surface hover:bg-surface3 transition-colors"
      >
        <Icon name="Bars3Icon" iconStyle="solid-24" size="sm" aria-hidden />
      </button>

      <div className="hidden lg:flex">
        <Button variant="filled" size="sm" color="primary" onClick={onLoginClick}>
          Login
        </Button>
      </div>
    </>
  );
};