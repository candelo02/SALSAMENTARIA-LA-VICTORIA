import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/cart_provider.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: const LaVictoriaApp(),
    ),
  );
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
          seedColor: const Color(0xFFC62828),
          primary: const Color(0xFFC62828),
          secondary: const Color(0xFFF57C00),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
