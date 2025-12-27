export interface CartItem {
    id: number;
    name: string;
    quantity: number;
}

export interface CartEntryPayload {
    school: {
        id: number;
        name: string;
    };
    grade: {
        id: number;
        name: string;
    };
    class: {
        id: number;
        name: string;
    };
    items: CartItem[];
}

