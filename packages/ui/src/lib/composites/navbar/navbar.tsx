import React, { useState, useCallback } from "react";
import { Box } from "../../components/box";
import { LogoSlot } from "./logo-slot";
import { NavSlot } from "./nav-slot";
import { UserSlot } from "./user-slot";
import { NavSlideout } from "./nav-slideout";
import { NavbarProps, ProfileLink } from "./navbar.types";

const DEFAULT_PROFILE_LINKS: ProfileLink[] = [
  { path: "/profile", label: "Profile" },
  { path: "/settings", label: "Settings" },
  { path: "/auth/logout", label: "Sign out" },
];

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  pages,
  isAuthenticated,
  user,
  onNavigate,
  onLoginClick,
  profileLinks = DEFAULT_PROFILE_LINKS,
}) => {
  const [slideoutOpen, setSlideoutOpen] = useState(false);

  const openSlideout = useCallback(() => setSlideoutOpen(true), []);
  const closeSlideout = useCallback(() => setSlideoutOpen(false), []);

  return (
    <>
      <Box
        direction="row"
        align="center"
        justify="between"
        px="4"
        bg="surface2"
        className="h-16 w-full"
      >
        <LogoSlot imageSrc={logo?.imageSrc} title={logo?.title} />

        <div className="flex items-center gap-3 ml-auto">
          <NavSlot pages={pages} onNavigate={onNavigate} />

          <UserSlot
            isAuthenticated={isAuthenticated}
            user={user}
            onAvatarClick={openSlideout}
            onHamburgerClick={openSlideout}
            onLoginClick={onLoginClick ?? (() => {})}
          />
        </div>
      </Box>

      <NavSlideout
        open={slideoutOpen}
        onClose={closeSlideout}
        isAuthenticated={isAuthenticated}
        pages={pages}
        onNavigate={onNavigate}
        profileLinks={profileLinks}
      />
    </>
  );
};