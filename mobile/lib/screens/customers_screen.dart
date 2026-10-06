import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/customer_model.dart';
import '../providers/cart_provider.dart';

class CustomersScreen extends StatelessWidget {
  const CustomersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    final mockCustomers = [
      CustomerModel(
        id: 'cust-1',
        name: 'Restaurante El Sabor del Valle',
        nitDocument: '900123456-1',
        phone: '3101234567',
        address: 'Calle 15 # 4-22, Centro',
        municipality: 'Tumaco',
        neighborhood: 'Centro',
        contactPerson: 'Don Juan Pérez',
        customerType: 'Restaurante',
      ),
      CustomerModel(
        id: 'cust-2',
        name: 'Distribuidora La Economía',
        nitDocument: '900987654-3',
        phone: '3158765432',
        address: 'Carrera 8 # 12-50, Zona Industrial',
        municipality: 'Tumaco',
        neighborhood: 'La Libertad',
        contactPerson: 'María Gómez',
        customerType: 'Mayorista',
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Clientes'),
        backgroundColor: const Color(0xFFC62828),
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        itemCount: mockCustomers.length,
        itemBuilder: (context, index) {
          final customer = mockCustomers[index];
          final isSelected = cart.selectedCustomerId == customer.id;

          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: isSelected ? Colors.green : const Color(0xFFC62828),
                child: Icon(isSelected ? Icons.check : Icons.store, color: Colors.white),
              ),
              title: Text(customer.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('${customer.address} (${customer.municipality})\nNIT: ${customer.nitDocument} | Tel: ${customer.phone}'),
              isThreeLine: true,
              trailing: ElevatedButton(
                onPressed: () {
                  cart.selectCustomer(customer.id, customer.name);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Cliente ${customer.name} seleccionado para el pedido.')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isSelected ? Colors.green : const Color(0xFFC62828),
                  foregroundColor: Colors.white,
                ),
                child: Text(isSelected ? 'Seleccionado' : 'Seleccionar'),
              ),
            ),
          );
        },
      ),
    );
  }
}
