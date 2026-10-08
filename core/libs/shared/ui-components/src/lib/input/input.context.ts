import { createContext } from 'react';

/** What an Input tells the adornments inside it. */
export const InputContext = createContext<{ disabled: boolean }>({ disabled: false });
