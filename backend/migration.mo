import Map "mo:core/Map";

module {
  type OldOrder = {
    id : Nat;
    buyer : Principal;
    items : [OldCartItem];
    total : Nat;
    status : Text;
    timestamp : Int;
  };
  type OldCartItem = {
    productId : Nat;
    quantity : Nat;
  };
  type OldActor = {
    orders : Map.Map<Nat, OldOrder>;
  };
  type NewOrder = {
    id : Nat;
    buyer : Principal;
    items : [OldCartItem];
    total : Nat;
    status : { #pending; #paid; #failed };
    timestamp : Int;
    stripePaymentIntentId : ?Text;
  };
  type NewActor = {
    orders : Map.Map<Nat, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_k, oldOrder) {
        let newStatus = switch (oldOrder.status) {
          case ("pending") { #pending };
          case ("paid") { #paid };
          case ("failed") { #failed };
          case (_) { #pending };
        };
        {
          oldOrder with
          status = newStatus;
          stripePaymentIntentId = null;
        };
      }
    );
    { orders = newOrders };
  };
};
