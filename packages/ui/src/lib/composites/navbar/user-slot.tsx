import React from "react";
import { Avatar } from "../avatar/avatar";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { usePageTransition } from "@inithium/store";

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
  const { controller } = usePageTransition();

  const handleLoginClick = async () => {
    await controller.triggerExit();
    onLoginClick();
  };

  if (isAuthenticated) {
    return (
      <Avatar
        src={user?.src}
        initials={user?.initials}
        size="md"
        options={{ gradient: user?.gradient }}
        onClick={onAvatarClick}
      />
    );
  }

  return (
    <>
      <Button
        onClick={onHamburgerClick}
        aria-label="Open navigation menu"
        className="flex lg:hidden items-center justify-center rounded-md p-1.5 text-on-surface hover:bg-surface3 transition-colors"
      >
        <Icon name="Bars3Icon" iconStyle="solid-24" size="sm" aria-hidden />
      </Button>

      <div className="hidden lg:flex">
        <Button variant="filled" size="sm" color="primary" onClick={handleLoginClick}> 
          Login
        </Button>
      </div>
    </>
  );
};