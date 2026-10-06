import 'product_model.dart';

class OrderItemModel {
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double subtotal;

  OrderItemModel({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
  });

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'quantity': quantity,
    };
  }
}

class OrderModel {
  final String id; // Client-Generated UUID
  final String customerId;
  final String customerName;
  final List<OrderItemModel> items;
  final double totalAmount;
  final String? notes;
  final String status;
  final DateTime clientCreatedAt;
  final bool synced;

  OrderModel({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.items,
    required this.totalAmount,
    this.notes,
    this.status = 'PENDIENTE',
    required this.clientCreatedAt,
    this.synced = false,
  });

  Map<String, dynamic> toSyncJson() {
    return {
      'id': id,
      'customerId': customerId,
      'notes': notes,
      'clientCreatedAt': clientCreatedAt.toIso8601String(),
      'items': items.map((i) => i.toJson()).toList(),
    };
  }
}
