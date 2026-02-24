import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Setup authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Types
  type ProductId = Nat;
  type OrderId = Nat;

  public type UserRole = { #buyer; #seller };

  public type UserProfile = {
    name : Text;
    contact : Text;
    role : UserRole;
  };

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    blob : Storage.ExternalBlob;
    seller : Principal;
    stock : Nat;
    city : Text;
  };

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  public type OrderStatus = {
    #pending;
    #paid;
    #failed;
  };

  type Order = {
    id : OrderId;
    buyer : Principal;
    items : [CartItem];
    total : Nat;
    status : OrderStatus;
    timestamp : Time.Time;
    stripePaymentIntentId : ?Text;
  };

  // State
  var nextProductId : ProductId = 0;
  var nextOrderId : OrderId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<ProductId, Product>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<OrderId, Order>();

  // Stripe vars and management
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  // Proxy to enable http-outcalls from Stripe component
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Stripe outcalls
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Product Functions ───────────────────────────────────────────────────────

  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    blob : Storage.ExternalBlob,
    stock : Nat,
  ) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add products");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found: Please register first") };
      case (?p) { p };
    };
    switch (profile.role) {
      case (#seller) {};
      case (#buyer) { Runtime.trap("Unauthorized: Only sellers can add products") };
    };
    if (stock == 0) { Runtime.trap("Stock must be greater than 0") };
    let productId = nextProductId;
    nextProductId += 1;
    let product : Product = {
      id = productId;
      name;
      description;
      price;
      category;
      blob;
      seller = caller;
      stock;
      city = "Kodinar";
    };
    products.add(productId, product);
    productId;
  };

  public shared ({ caller }) func updateProduct(
    productId : ProductId,
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    blob : Storage.ExternalBlob,
    stock : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update products");
    };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    if (product.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the seller or an admin can update this product");
    };
    let updated : Product = {
      id = productId;
      name;
      description;
      price;
      category;
      blob;
      seller = product.seller;
      stock;
      city = product.city;
    };
    products.add(productId, updated);
  };

  public shared ({ caller }) func markOutOfStock(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update products");
    };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    if (product.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the seller or an admin can mark this product out of stock");
    };
    let updated : Product = {
      id = product.id;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      blob = product.blob;
      seller = product.seller;
      stock = 0;
      city = product.city;
    };
    products.add(productId, updated);
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can delete products");
    };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    if (product.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the seller or an admin can delete this product");
    };
    products.remove(productId);
  };

  public query func getProduct(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p : Product) : Bool { p.category == category });
  };

  public query ({ caller }) func getMyProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their products");
    };
    products.values().toArray().filter(func(p : Product) : Bool { p.seller == caller });
  };

  // ── Cart Functions ──────────────────────────────────────────────────────────

  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can use the cart");
    };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    if (product.stock == 0) { Runtime.trap("Product is out of stock") };
    if (quantity > product.stock) {
      Runtime.trap("Requested quantity exceeds available stock");
    };
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?c) { c };
    };
    // Update quantity if item already in cart, otherwise add
    var found = false;
    let updatedCart = currentCart.map(func(item : CartItem) : CartItem {
      if (item.productId == productId) {
        found := true;
        { productId; quantity };
      } else {
        item;
      };
    });
    if (found) {
      carts.add(caller, updatedCart);
    } else {
      carts.add(caller, currentCart.concat([{ productId; quantity }]));
    };
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can use the cart");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?c) { c };
    };
    let updatedCart = currentCart.filter(func(item : CartItem) : Bool {
      item.productId != productId;
    });
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can use the cart");
    };
    carts.add(caller, []);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?c) { c };
    };
  };

  // ── Order Functions ─────────────────────────────────────────────────────────

  public shared ({ caller }) func placeOrder() : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can place orders");
    };
    let cartItems = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) {
        if (c.size() == 0) { Runtime.trap("Cart is empty") };
        c;
      };
    };
    // Calculate total and validate stock
    var total : Nat = 0;
    for (item in cartItems.vals()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # debug_show (item.productId)) };
        case (?p) { p };
      };
      if (item.quantity > product.stock) {
        Runtime.trap("Insufficient stock for product: " # product.name);
      };
      total += product.price * item.quantity;
    };
    // Deduct stock
    for (item in cartItems.vals()) {
      switch (products.get(item.productId)) {
        case (null) {};
        case (?product) {
          let updated : Product = {
            id = product.id;
            name = product.name;
            description = product.description;
            price = product.price;
            category = product.category;
            blob = product.blob;
            seller = product.seller;
            stock = product.stock - item.quantity;
            city = product.city;
          };
          products.add(item.productId, updated);
        };
      };
    };
    let orderId = nextOrderId;
    nextOrderId += 1;
    let order : Order = {
      id = orderId;
      buyer = caller;
      items = cartItems;
      total;
      status = #pending;
      timestamp = Time.now();
      stripePaymentIntentId = null;
    };
    orders.add(orderId, order);
    // Clear cart after order
    carts.add(caller, []);
    orderId;
  };

  public shared ({ caller }) func createStripePaymentIntent(orderId : OrderId) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create payment intents");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    if (order.buyer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create payment intent for your own orders");
    };
    if (order.total == 0) { Runtime.trap("Order total must be a positive value") };
    let paymentIntentId = switch (order.stripePaymentIntentId) {
      case (null) { "pi_" # Nat.toText(order.id) };
      case (?existingId) { existingId };
    };
    // Update order with payment intent ID
    let updatedOrder : Order = {
      id = order.id;
      buyer = order.buyer;
      items = order.items;
      total = order.total;
      status = order.status;
      timestamp = order.timestamp;
      stripePaymentIntentId = ?paymentIntentId;
    };
    orders.add(orderId, updatedOrder);
    paymentIntentId;
  };

  // Only admins can update payment status to prevent users from self-declaring
  // their orders as paid without actual payment verification.
  public shared ({ caller }) func updatePaymentStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    let updatedOrder : Order = {
      id = order.id;
      buyer = order.buyer;
      items = order.items;
      total = order.total;
      status;
      timestamp = order.timestamp;
      stripePaymentIntentId = order.stripePaymentIntentId;
    };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their orders");
    };
    orders.values().toArray().filter(func(o : Order) : Bool { o.buyer == caller });
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view orders");
    };
    let order = orders.get(orderId);
    switch (order) {
      case (null) { null };
      case (?o) {
        if (o.buyer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?o;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };
};
