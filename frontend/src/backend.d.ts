import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: ProductId;
    blob: ExternalBlob;
    city: string;
    name: string;
    description: string;
    seller: Principal;
    stock: bigint;
    category: string;
    price: bigint;
}
export type OrderId = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    total: bigint;
    timestamp: Time;
    stripePaymentIntentId?: string;
    buyer: Principal;
    items: Array<CartItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface UserProfile {
    contact: string;
    name: string;
    role: UserRole;
}
export enum OrderStatus {
    pending = "pending",
    paid = "paid",
    failed = "failed"
}
export enum UserRole {
    seller = "seller",
    buyer = "buyer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: bigint, category: string, blob: ExternalBlob, stock: bigint): Promise<ProductId>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createStripePaymentIntent(orderId: OrderId): Promise<string>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCart(): Promise<Array<CartItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyProducts(): Promise<Array<Product>>;
    getOrder(orderId: OrderId): Promise<Order | null>;
    getProduct(productId: ProductId): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markOutOfStock(productId: ProductId): Promise<void>;
    placeOrder(): Promise<OrderId>;
    removeFromCart(productId: ProductId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePaymentStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateProduct(productId: ProductId, name: string, description: string, price: bigint, category: string, blob: ExternalBlob, stock: bigint): Promise<void>;
}
