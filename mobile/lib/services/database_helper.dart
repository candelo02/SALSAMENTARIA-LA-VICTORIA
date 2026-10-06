import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('la_victoria_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    // 1. Categories Table
    await db.execute('''
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )
    ''');

    // 2. Products Table
    await db.execute('''
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        characteristics TEXT,
        presentation TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        status TEXT NOT NULL,
        category_id TEXT
      )
    ''');

    // 3. Customers Table
    await db.execute('''
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nit_document TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        municipality TEXT NOT NULL,
        neighborhood TEXT,
        contact_person TEXT,
        customer_type TEXT,
        synced INTEGER DEFAULT 1
      )
    ''');

    // 4. Offline Orders Table
    await db.execute('''
      CREATE TABLE offline_orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        total_amount REAL NOT NULL,
        notes TEXT,
        client_created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        sync_error TEXT
      )
    ''');

    // 5. Offline Order Items Table
    await db.execute('''
      CREATE TABLE offline_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES offline_orders (id) ON DELETE CASCADE
      )
    ''');
  }

  Future<void> saveInitialCatalog(List<Map<String, dynamic>> categories, List<Map<String, dynamic>> products) async {
    final db = await instance.database;
    final batch = db.batch();

    batch.delete('categories');
    batch.delete('products');

    for (var cat in categories) {
      batch.insert('categories', cat, conflictAlgorithm: ConflictAlgorithm.replace);
    }

    for (var prod in products) {
      batch.insert('products', {
        'id': prod['id'],
        'name': prod['name'],
        'description': prod['description'],
        'characteristics': prod['characteristics'],
        'presentation': prod['presentation'],
        'price': (prod['price'] as num).toDouble(),
        'stock': prod['stock'],
        'status': prod['status'],
        'category_id': prod['categoryId'],
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }

    await batch.commit(noResult: true);
  }

  Future<void> saveOrderOffline(Map<String, dynamic> order, List<Map<String, dynamic>> items) async {
    final db = await instance.database;
    await db.transaction((txn) async {
      await txn.insert('offline_orders', order, conflictAlgorithm: ConflictAlgorithm.replace);
      for (var item in items) {
        await txn.insert('offline_order_items', item);
      }
    });
  }

  Future<List<Map<String, dynamic>>> getUnsyncedOrders() async {
    final db = await instance.database;
    final orders = await db.query('offline_orders', where: 'synced = ?', whereArgs: [0]);

    List<Map<String, dynamic>> fullOrders = [];
    for (var order in orders) {
      final items = await db.query('offline_order_items', where: 'order_id = ?', whereArgs: [order['id']]);
      fullOrders.add({
        ...order,
        'items': items,
      });
    }

    return fullOrders;
  }

  Future<void> markOrdersAsSynced(List<String> orderIds) async {
    final db = await instance.database;
    final batch = db.batch();
    for (var id in orderIds) {
      batch.update('offline_orders', {'synced': 1}, where: 'id = ?', whereArgs: [id]);
    }
    await batch.commit(noResult: true);
  }

  Future<close>() async {
    final db = await instance.database;
    db.close();
  }
}
