/**
 * @fileoverview Cart Type Definitions
 *
 * This module contains TypeScript interfaces for shopping cart data structures
 * used throughout the application.
 *
 * @module types/cart
 */

/**
 * Represents a single item in the shopping cart.
 */
export interface CartItem {
    /** Unique identifier for the equipment item */
    id: number;
    /** Display name of the item */
    name: string;
    /** Quantity of this item in the cart */
    quantity: number;
}

/**
 * Payload structure for cart API operations.
 * Groups items by school and grade for submission to the backend.
 */
export interface CartEntryPayload {
    /** The selected school */
    school: {
        /** School unique identifier */
        id: number;
        /** School display name */
        name: string;
    };
    /** The selected grade/class */
    grade: {
        /** Grade unique identifier */
        id: number;
        /** Grade display name */
        name: string;
    };
    /** List of equipment items in this cart entry */
    items: CartItem[];
}

