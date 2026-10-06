class ProductModel {
  final String id;
  final String name;
  final String description;
  final String? characteristics;
  final String presentation;
  final String unitOfMeasure;
  final double price;
  final int stock;
  final String status;
  final String categoryId;
  final String? categoryName;
  final String? photoUrl;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    this.characteristics,
    required this.presentation,
    required this.unitOfMeasure,
    required this.price,
    required this.stock,
    required this.status,
    required this.categoryId,
    this.categoryName,
    this.photoUrl,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      characteristics: json['characteristics'],
      presentation: json['presentation'] ?? '',
      unitOfMeasure: json['unitOfMeasure'] ?? 'Unidad',
      price: double.parse((json['price'] ?? 0).toString()),
      stock: json['stock'] ?? 0,
      status: json['status'] ?? 'DISPONIBLE',
      categoryId: json['categoryId'] ?? json['category_id'] ?? '',
      categoryName: json['category'] != null ? json['category']['name'] : json['category_name'],
      photoUrl: json['photoUrl'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'characteristics': characteristics,
      'presentation': presentation,
      'unit_of_measure': unitOfMeasure,
      'price': price,
      'stock': stock,
      'status': status,
      'category_id': categoryId,
    };
  }
}
