import React from 'react';
import { Footer, Navbar, NavbarUser } from '@inithium/composites';
import { NavLink } from '@inithium/shared';

export const secondaryLinks: NavLink[] = [
  { label: "Profile", href: "/profile" }
]

export const navLinks: NavLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Products",
    dropdown: [
      {
        label: "All Products",
        href: "/products",
      },
      {
        label: "New Arrivals",
        href: "/products/new",
      },
      {
        label: "Best Sellers",
        href: "/products/best-sellers",
      },
    ],
  },
  {
    label: "Services",
    dropdown: [
      {
        label: "Consulting",
        href: "/services/consulting",
      },
      {
        label: "Implementation",
        href: "/services/implementation",
      },
      {
        label: "Support",
        href: "/services/support",
      },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export const user: NavbarUser = {
  name: "August Brown",
  avatarUrl: "https://i.pravatar.cc/150?img=3",
};

export const handleLogout = () => {
  console.log("User logged out");
};

const App: React.FC = () => {
    return (
        <div className="h-full w-full bg-surface">
            <Navbar
              logoText='Inithium'
              links={navLinks}
              secondaryLinks={secondaryLinks}
              user={user}
              onLogout={handleLogout}
            />    
            <div>Content</div>
            <Footer
              links={navLinks}
              secondaryLinks={secondaryLinks}
            />       
        </div>
    );
};

export default App;
