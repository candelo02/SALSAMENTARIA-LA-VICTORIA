class CustomerModel {
  final String id;
  final String name;
  final String nitDocument;
  final String phone;
  final String address;
  final String municipality;
  final String? neighborhood;
  final String? contactPerson;
  final String customerType;
  final double? lat;
  final double? lng;
  final String? notes;

  CustomerModel({
    required this.id,
    required this.name,
    required this.nitDocument,
    required this.phone,
    required this.address,
    required this.municipality,
    this.neighborhood,
    this.contactPerson,
    this.customerType = 'General',
    this.lat,
    this.lng,
    this.notes,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'],
      name: json['name'],
      nitDocument: json['nitDocument'] ?? json['nit_document'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      municipality: json['municipality'] ?? '',
      neighborhood: json['neighborhood'],
      contactPerson: json['contactPerson'] ?? json['contact_person'],
      customerType: json['customerType'] ?? json['customer_type'] ?? 'General',
      lat: json['lat'] != null ? double.parse(json['lat'].toString()) : null,
      lng: json['lng'] != null ? double.parse(json['lng'].toString()) : null,
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'nit_document': nitDocument,
      'phone': phone,
      'address': address,
      'municipality': municipality,
      'neighborhood': neighborhood,
      'contact_person': contactPerson,
      'customer_type': customerType,
    };
  }
}
