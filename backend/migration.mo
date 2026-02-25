import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";

module {
  type ProductId = Nat;
  type OrderId = Nat;

  // Old types
  type OldProduct = {
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

  type OldOrder = {
    id : OrderId;
    buyer : Principal;
    items : [CartItem];
    total : Nat;
    status : OrderStatus;
    timestamp : Time.Time;
    stripePaymentIntentId : ?Text;
  };

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  type OrderStatus = {
    #pending;
    #paid;
    #failed;
  };

  type OldActor = {
    nextProductId : ProductId;
    nextOrderId : OrderId;
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<ProductId, OldProduct>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<OrderId, OldOrder>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  type UserRole = { #buyer; #seller };

  type UserProfile = {
    name : Text;
    contact : Text;
    role : UserRole;
  };

  // New types
  type Category = {
    #fruits;
    #vegetables;
    #bakedGoods;
    #dairy;
    #nuts;
    #beverages;
    #seafood;
  };

  type NewProduct = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Nat;
    category : Category;
    blob : Storage.ExternalBlob;
    seller : Principal;
    stock : Nat;
    city : Text;
  };

  type NewOrder = {
    id : OrderId;
    buyer : Principal;
    items : [CartItem];
    total : Nat;
    status : OrderStatus;
    timestamp : Time.Time;
    stripePaymentIntentId : ?Text;
  };

  type NewActor = {
    nextProductId : ProductId;
    nextOrderId : OrderId;
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<ProductId, NewProduct>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<OrderId, NewOrder>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  func textToCategory(categoryText : Text) : Category {
    switch (categoryText) {
      case ("fruits") { #fruits };
      case ("vegetables") { #vegetables };
      case ("bakedGoods") { #bakedGoods };
      case ("dairy") { #dairy };
      case ("nuts") { #nuts };
      case ("beverages") { #beverages };
      case ("seafood") { #seafood };
      case (_) { #fruits }; // Default to fruits if not matched
    };
  };

  public func run(old : OldActor) : NewActor {
    let products = old.products.map<ProductId, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          category = textToCategory(oldProduct.category)
        };
      }
    );
    let orders = old.orders.map<OrderId, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          id = oldOrder.id;
          buyer = oldOrder.buyer;
          items = oldOrder.items;
          total = oldOrder.total;
          status = oldOrder.status;
          timestamp = oldOrder.timestamp;
          stripePaymentIntentId = oldOrder.stripePaymentIntentId;
        };
      }
    );
    {
      old with
      products;
      orders;
    };
  };
};
