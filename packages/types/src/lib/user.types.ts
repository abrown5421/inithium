import { AvatarrProps } from "./avatar.types.js";
import { BannerProps } from "./banner.types.js";

export interface User {
    _id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'super-admin' | 'admin' | 'editor' | 'writer' | 'user'; 
    user_banner?: BannerProps;
    user_avatar?: AvatarrProps;
}