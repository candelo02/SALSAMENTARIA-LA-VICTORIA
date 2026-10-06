class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String token;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, String token) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      role: json['role'] ?? 'VENDEDOR',
      token: token,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role,
      'token': token,
    };
  }
}
