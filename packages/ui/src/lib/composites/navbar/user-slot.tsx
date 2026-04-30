import React from "react";
import { Avatar } from "../avatar/avatar";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { usePageTransition } from "@inithium/store";
import { UserSlotProps } from "./navbar.types";

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

  if (isAuthenticated && user) {
    const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
    
    return (
      <Avatar
        src={(user as any).avatar_url}
        initials={initials}
        options={{ 
          gradient: user.user_avatar?.gradient, 
          font: user.user_avatar?.font, 
          variant: user.user_avatar?.variant 
        }}
        onClick={onAvatarClick}
      />
    );
  }

  return (
    <>
      <Button
        onClick={onHamburgerClick}
        className="flex lg:hidden items-center justify-center rounded-md p-1.5 text-on-surface hover:bg-surface3 transition-colors"
      >
        <Icon name="Bars3Icon" iconStyle="solid-24" size="sm" />
      </Button>

      <div className="hidden lg:flex">
        <Button variant="filled" size="sm" color="primary" onClick={handleLoginClick}> 
          Login
        </Button>
      </div>
    </>
  );
};