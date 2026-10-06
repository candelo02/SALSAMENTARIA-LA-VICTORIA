import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000';

  static Future<UserModel?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UserModel.fromJson(data['user'], data['accessToken']);
      }
    } catch (e) {
      print('Error en login API: $e');
    }
    return null;
  }

  static Future<Map<String, dynamic>?> fetchInitialData(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sync/initial-data'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Error al descargar datos iniciales: $e');
    }
    return null;
  }

  static Future<bool> postBatchSync(String token, Map<String, dynamic> batchData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sync/batch'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(batchData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
    } catch (e) {
      print('Error al sincronizar lote offline: $e');
    }
    return false;
  }
}
