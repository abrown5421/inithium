import React from "react";
import { Avatar } from "../avatar/avatar";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { usePageTransition } from "@inithium/store";
import { UserSlotProps } from "./navbar.types";
import { useLocation } from 'react-router-dom';

function useCollapseTransition(shouldCollapse: boolean) {
  const [isCollapsed, setIsCollapsed] = React.useState(shouldCollapse);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsCollapsed(shouldCollapse);
    });
    return () => cancelAnimationFrame(frame);
  }, [shouldCollapse]);

  return isCollapsed;
}

export const UserSlot: React.FC<UserSlotProps> = ({
  isAuthenticated,
  user,
  collapseOnLogin,
  onAvatarClick,
  onHamburgerClick,
  onLoginClick,
}) => {
  const { controller } = usePageTransition();
  const location = useLocation();

  const isCollapsed = useCollapseTransition((collapseOnLogin ?? false) && location.pathname === '/auth/login');

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

      <div
        className="hidden lg:flex justify-end overflow-hidden transition-[max-width] duration-500 ease-in-out"
        style={{ maxWidth: isCollapsed ? '0px' : '200px' }}
      >
        <Button variant="filled" size="sm" color="primary" onClick={handleLoginClick}>
          Login
        </Button>
      </div>
    </>
  );
};