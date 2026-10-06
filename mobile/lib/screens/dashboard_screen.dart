import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user_model.dart';
import '../providers/cart_provider.dart';
import 'catalog_screen.dart';
import 'customers_screen.dart';
import 'cart_screen.dart';

class DashboardScreen extends StatelessWidget {
  final UserModel? user;

  const DashboardScreen({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFC62828),
        foregroundColor: Colors.white,
        title: Text(user != null ? 'Hola, ${user!.fullName}' : 'La Victoria - Comercial'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CartScreen()));
                },
              ),
              if (cart.itemCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: CircleAvatar(
                    radius: 10,
                    backgroundColor: Colors.amber,
                    child: Text(
                      '${cart.itemCount}',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black),
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.sync_rounded),
            tooltip: 'Sincronizar Offline',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sincronizando datos offline con el servidor...')),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (user != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(10)),
                child: Row(
                  children: [
                    const Icon(Icons.account_circle, color: Color(0xFFC62828), size: 36),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user!.fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('Rol: ${user!.role} | Modo: Online / Offline', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              ),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16.0,
                mainAxisSpacing: 16.0,
                children: [
                  _buildMenuCard(
                    context,
                    'Catálogo Digital',
                    Icons.menu_book_rounded,
                    Colors.red[700]!,
                    'Consultar productos y precios',
                    () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CatalogScreen())),
                  ),
                  _buildMenuCard(
                    context,
                    'Clientes',
                    Icons.people_alt_rounded,
                    Colors.blue[700]!,
                    'Gestión de clientes y visitas',
                    () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CustomersScreen())),
                  ),
                  _buildMenuCard(
                    context,
                    'Carrito / Pedido',
                    Icons.add_shopping_cart_rounded,
                    Colors.green[700]!,
                    'Creación de Pedidos Offline',
                    () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CartScreen())),
                  ),
                  _buildMenuCard(
                    context,
                    'Sincronización',
                    Icons.cloud_sync_rounded,
                    Colors.teal[700]!,
                    'Cola de envíos pendientes',
                    () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Sincronización batch completada exitosamente.')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard(BuildContext context, String title, IconData icon, Color color, String subtitle, VoidCallback onTap) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: color.withOpacity(0.12),
                child: Icon(icon, size: 32, color: color),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
