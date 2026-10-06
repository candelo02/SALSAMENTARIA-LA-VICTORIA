import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product_model.dart';
import '../providers/cart_provider.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final List<ProductModel> _mockProducts = [
    ProductModel(
      id: 'prod-1',
      name: 'Salsa de Tomate Especial 500ml',
      description: 'Salsa elaborada con tomates seleccionados, consistencia espesa ideal para comidas rápidas.',
      characteristics: 'Producto nacional, sin conservantes artificiales excesivos, presentación 500ml.',
      presentation: 'Frasco PET 500 ml',
      unitOfMeasure: 'Unidad',
      price: 8500.0,
      stock: 120,
      status: 'DISPONIBLE',
      categoryId: 'cat-1',
      categoryName: 'Salsas Tradicionales',
    ),
    ProductModel(
      id: 'prod-2',
      name: 'Salsa de Ajo Casera 250ml',
      description: 'Salsa sabor intenso a ajo natural con toques de finas hierbas.',
      characteristics: 'Ideal para carnes, patacones y aperitivos.',
      presentation: 'Botella PET 250 ml',
      unitOfMeasure: 'Unidad',
      price: 6200.0,
      stock: 45,
      status: 'DISPONIBLE',
      categoryId: 'cat-1',
      categoryName: 'Salsas Tradicionales',
    ),
    ProductModel(
      id: 'prod-3',
      name: 'Aderezo BBQ Ahumado 1kg',
      description: 'Salsa BBQ estilo americano con sabor ahumado profundo y nota dulce refinada.',
      characteristics: 'Uso industrial y restaurantes.',
      presentation: 'Galón PET 1000 gr',
      unitOfMeasure: 'Galón',
      price: 24500.0,
      stock: 8,
      status: 'STOCK_BAJO',
      categoryId: 'cat-2',
      categoryName: 'Aderezos Especiales',
    ),
  ];

  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context, listen: false);

    final filteredProducts = _mockProducts.where((p) {
      return p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.categoryName!.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Catálogo Digital de Salsas'),
        backgroundColor: const Color(0xFFC62828),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Buscar productos o categorías...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                });
              },
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: filteredProducts.length,
              itemBuilder: (context, index) {
                final product = filteredProducts[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        Container(
                          width: 70,
                          height: 70,
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.soup_kitchen_rounded, size: 40, color: Color(0xFFC62828)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                product.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              Text(
                                '${product.presentation} | ${product.categoryName}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '\$${product.price.toStringAsFixed(0)} COP',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFC62828), fontSize: 16),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            cart.addProduct(product);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${product.name} agregado al pedido.'),
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                          icon: const Icon(Icons.add_shopping_cart, size: 18),
                          label: const Text('Agregar'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFC62828),
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
