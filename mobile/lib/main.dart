import 'package:flutter/material.dart';

void main() {
  runApp(const LaVictoriaApp());
}

class LaVictoriaApp extends StatelessWidget {
  const LaVictoriaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'La Victoria - Gestión Comercial',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFC62828), // Red theme for sauce factory
          primary: const Color(0xFFC62828),
          secondary: const Color(0xFFF57C00),
        ),
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('La Victoria - Comercial & Logística'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync_rounded),
            tooltip: 'Sincronizar Offline',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sincronizando datos con el servidor central...')),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        body: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16.0,
          mainAxisSpacing: 16.0,
          children: [
            _buildMenuCard(context, 'Catálogo Digital', Icons.menu_book, Colors.red, 'Consultar productos y precios'),
            _buildMenuCard(context, 'Clientes', Icons.people, Colors.blue, 'Gestión de clientes y visitas'),
            _buildMenuCard(context, 'Crear Pedido', Icons.add_shopping_cart, Colors.green, 'Modo Online/Offline'),
            _buildMenuCard(context, 'Mis Rutas', Icons.alt_route, Colors.orange, 'Rutas asignadas del día'),
            _buildMenuCard(context, 'Bodega e Inventario', Icons.warehouse, Colors.purple, 'Estado de existencias'),
            _buildMenuCard(context, 'Sincronización', Icons.cloud_sync, Colors.teal, 'Cola de envíos pendientes'),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard(BuildContext context, String title, IconData icon, Color color, String subtitle) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: color.withOpacity(0.1),
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
