import React, { useState, useCallback } from "react";
import { Box } from "../../components/box";
import { LogoSlot } from "./logo-slot";
import { NavSlot } from "./nav-slot";
import { UserSlot } from "./user-slot";
import { NavSlideout } from "./nav-slideout";
import { NavbarProps, ProfileLink } from "./navbar.types";

const getDefaultProfileLinks = (userId?: string): ProfileLink[] => [
  { path: userId ? `/profile/${userId}` : "/profile", label: "Profile" },
  { path: userId ? `/settings/${userId}` : "/settings", label: "Settings" },
];

const getPagesByLocation = (pages: any[], location: string) =>
  pages.filter((p) => {
    const loc = p.navigation?.location ?? p.location;
    return loc ? loc === location : location === "main";
  });

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  pages,
  isAuthenticated,
  user,
  onNavigate,
  onLoginClick,
  profileLinks,
}) => {
  const resolvedProfileLinks = profileLinks ?? getDefaultProfileLinks(user?._id);
  const [slideoutOpen, setSlideoutOpen] = useState(false);

  const openSlideout = useCallback(() => setSlideoutOpen(true), []);
  const closeSlideout = useCallback(() => setSlideoutOpen(false), []);

  const mainPages = getPagesByLocation(pages, "main");

  return (
    <>
      <Box
        direction="row"
        align="center"
        justify="between"
        px="4"
        bg="surface2"
        className="h-16 w-full shadow-nav z-30 relative"
      >
        <LogoSlot imageSrc={logo?.imageSrc} title={logo?.title} />

        <div className="flex items-center gap-3 ml-auto">
          <NavSlot pages={mainPages} onNavigate={onNavigate} />

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
        pages={mainPages}
        onNavigate={onNavigate}
        profileLinks={resolvedProfileLinks}
      />
    </>
  );
};