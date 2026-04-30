import { AnimateEntry, AnimateExit, AnimateSpeed } from "./animation.types.js";
import { ThemeColor } from "./theme.types.js";
import { User } from "./user.types.js";

export type NavLocation = 'main' | 'profile' | 'footer' | 'none';

export interface NavigationConfig {
  label: string;
  location: NavLocation;
  order?: number;
  authenticated?: boolean;
  anonymous?: boolean;
  isButton?: boolean;
  resolveNavPath?: (user: User) => string;
}

export interface PageDefinition {
  key: string;
  path: string;
  entry: AnimateEntry;
  exit: AnimateExit;
  entrySpeed?: AnimateSpeed;
  exitSpeed?: AnimateSpeed;
  bg: ThemeColor;
  color?: ThemeColor;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  navigation?: NavigationConfig;
  centered?: boolean;
}
