import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../models/product_model.dart';
import '../models/order_model.dart';
import '../services/database_helper.dart';

class CartItem {
  final ProductModel product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get subtotal => product.price * quantity;
}

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];
  String? _selectedCustomerId;
  String? _selectedCustomerName;

  List<CartItem> get items => _items;
  String? get selectedCustomerId => _selectedCustomerId;
  String? get selectedCustomerName => _selectedCustomerName;

  double get totalAmount => _items.fold(0, (sum, item) => sum + item.subtotal);
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  void selectCustomer(String id, String name) {
    _selectedCustomerId = id;
    _selectedCustomerName = name;
    notifyListeners();
  }

  void addProduct(ProductModel product) {
    final index = _items.indexWhere((item) => item.product.id == product.id);
    if (index >= 0) {
      _items[index].quantity += 1;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
  }

  void updateQuantity(String productId, int quantity) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    _selectedCustomerId = null;
    _selectedCustomerName = null;
    notifyListeners();
  }

  Future<OrderModel?> checkoutOffline({String? notes}) async {
    if (_selectedCustomerId == null || _items.isEmpty) return null;

    final uuid = const Uuid().v4();
    final now = DateTime.now();

    final orderItems = _items.map((item) {
      return OrderItemModel(
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.subtotal,
      );
    }).toList();

    final order = OrderModel(
      id: uuid,
      customerId: _selectedCustomerId!,
      customerName: _selectedCustomerName ?? 'Cliente',
      items: orderItems,
      totalAmount: totalAmount,
      notes: notes,
      clientCreatedAt: now,
      synced: false,
    );

    // Save order in SQLite local DB
    await DatabaseHelper.instance.saveOrderOffline(
      {
        'id': order.id,
        'customer_id': order.customerId,
        'total_amount': order.totalAmount,
        'notes': order.notes,
        'client_created_at': order.clientCreatedAt.toIso8601String(),
        'synced': 0,
      },
      orderItems.map((item) => {
        'order_id': order.id,
        'product_id': item.productId,
        'quantity': item.quantity,
        'unit_price': item.unitPrice,
        'subtotal': item.subtotal,
      }).toList(),
    );

    clearCart();
    return order;
  }
}
