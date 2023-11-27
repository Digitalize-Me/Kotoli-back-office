import { Timestamp } from "@firebase/firestore-types";

export interface User {
    id?: string;
    display_name: string;
    email: string;
    phoneNumber: string;
    disabled: boolean;
    role:string;
    photo_url?: string;
    created_time: Timestamp;
    city: string;
}
