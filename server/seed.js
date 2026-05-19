require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const User = require('./models/User')
const Medicine = require('./models/Medicine')
const Order = require('./models/Order')
const Cart = require('./models/Cart')

const medicines = [
  { name: 'Paracetamol 500mg', brand: 'Calpol', price: 28, mrp: 35, image: '💊', category: 'Pain Relief', stock: 150, inStock: true, prescription: false, description: 'Effective pain reliever and fever reducer.', dosage: '1–2 tablets every 4–6 hours', sideEffects: 'Rare: nausea, allergic reactions', manufacturer: 'GSK', badge: 'bestseller', sku: 'MED-001' },
  { name: 'Amoxicillin 250mg', brand: 'Mox', price: 85, mrp: 110, image: '💉', category: 'Antibiotics', stock: 60, inStock: true, prescription: true, description: 'Broad-spectrum antibiotic for bacterial infections.', dosage: '1 capsule 3 times a day', sideEffects: 'Diarrhea, rash, stomach upset', manufacturer: 'Ranbaxy', badge: 'prescription', sku: 'MED-002' },
  { name: 'Cetirizine 10mg', brand: 'Zyrtec', price: 45, mrp: 58, image: '🌿', category: 'Allergy', stock: 200, inStock: true, prescription: false, description: 'Fast-acting antihistamine for allergy relief.', dosage: '1 tablet once daily', sideEffects: 'Drowsiness, dry mouth', manufacturer: 'UCB', badge: 'popular', sku: 'MED-003' },
  { name: 'Omeprazole 20mg', brand: 'Prilosec', price: 65, mrp: 80, image: '🧬', category: 'Digestive', stock: 90, inStock: true, prescription: false, description: 'Proton pump inhibitor for acid reflux.', dosage: '1 capsule before meals', sideEffects: 'Headache, diarrhea, nausea', manufacturer: 'AstraZeneca', sku: 'MED-004' },
  { name: 'Metformin 500mg', brand: 'Glucophage', price: 55, mrp: 70, image: '🔬', category: 'Diabetes', stock: 120, inStock: true, prescription: true, description: 'Controls blood sugar in type 2 diabetes.', dosage: '1 tablet twice daily with meals', sideEffects: 'Nausea, diarrhea, stomach pain', manufacturer: 'Merck', sku: 'MED-005' },
  { name: 'Vitamin D3 1000IU', brand: 'HealthVit', price: 199, mrp: 250, image: '☀️', category: 'Vitamins', stock: 300, inStock: true, prescription: false, description: 'Essential vitamin for bone health and immunity.', dosage: '1 capsule daily with food', sideEffects: 'Generally well-tolerated', manufacturer: 'HealthVit', badge: 'bestseller', sku: 'MED-006' },
  { name: 'Ibuprofen 400mg', brand: 'Brufen', price: 38, mrp: 48, image: '💊', category: 'Pain Relief', stock: 180, inStock: true, prescription: false, description: 'Anti-inflammatory for pain and fever.', dosage: '1 tablet every 6–8 hours', sideEffects: 'Stomach irritation, dizziness', manufacturer: 'Abbott', sku: 'MED-007' },
  { name: 'Azithromycin 500mg', brand: 'Zithromax', price: 145, mrp: 180, image: '💉', category: 'Antibiotics', stock: 40, inStock: true, prescription: true, description: 'Macrolide antibiotic for respiratory infections.', dosage: '1 tablet once daily for 3 days', sideEffects: 'Nausea, vomiting, diarrhea', manufacturer: 'Pfizer', sku: 'MED-008' },
  { name: 'Loratadine 10mg', brand: 'Claritin', price: 52, mrp: 65, image: '🌿', category: 'Allergy', stock: 15, inStock: true, prescription: false, description: 'Non-drowsy antihistamine for allergy symptoms.', dosage: '1 tablet once daily', sideEffects: 'Headache, dry mouth', manufacturer: 'Bayer', sku: 'MED-009' },
  { name: 'Pantoprazole 40mg', brand: 'Pantocid', price: 72, mrp: 90, image: '🧬', category: 'Digestive', stock: 0, inStock: false, prescription: false, description: 'Treats acid-related stomach conditions.', dosage: '1 tablet before breakfast', sideEffects: 'Headache, flatulence', manufacturer: 'Sun Pharma', sku: 'MED-010' },
  { name: 'Atorvastatin 10mg', brand: 'Lipitor', price: 95, mrp: 120, image: '❤️', category: 'Heart', stock: 75, inStock: true, prescription: true, description: 'Lowers cholesterol and reduces heart disease risk.', dosage: '1 tablet once daily at night', sideEffects: 'Muscle pain, liver enzyme changes', manufacturer: 'Pfizer', sku: 'MED-011' },
  { name: 'Multivitamin Complex', brand: 'Supradyn', price: 299, mrp: 380, image: '🌈', category: 'Vitamins', stock: 250, inStock: true, prescription: false, description: 'Complete daily nutrition supplement.', dosage: '1 tablet daily after breakfast', sideEffects: 'Generally well-tolerated', manufacturer: 'Bayer', badge: 'popular', sku: 'MED-012' },
]

const users = [
  {
    name: 'Ranjan',
    username: 'Ranjan1903',
    email: 'admin@medidrop.com',
    password: 'Ranjan2002',
    phone: '9999000001',
    role: 'admin',
  },
  {
    name: 'Rajan Kumar',
    email: 'customer@medidrop.com',
    password: 'Customer@123',
    phone: '9876543210',
    role: 'customer',
    addresses: [
      { label: 'Home', address: '42, Green Park, New Delhi - 110016', lat: 28.5672, lng: 77.2100, isDefault: true },
      { label: 'Office', address: 'Plot 7, Sector 44, Gurugram - 122003', lat: 28.4595, lng: 77.0266, isDefault: false },
    ],
  },
  {
    name: 'Arjun Singh',
    email: 'driver@medidrop.com',
    password: 'Driver@123',
    phone: '9876500001',
    role: 'driver',
    vehicle: 'Honda Activa - DL 5S AB 1234',
    isOnline: true,
    isVerified: true,
    rating: 4.8,
    ratingCount: 120,
    totalDeliveries: 340,
    totalEarnings: 85000,
    todayEarnings: 420,
  },
  {
    name: 'Priya Sharma',
    email: 'driver2@medidrop.com',
    password: 'Driver@123',
    phone: '9876500002',
    role: 'driver',
    vehicle: 'TVS Jupiter - DL 7M CD 5678',
    isOnline: false,
    isVerified: true,
    rating: 4.6,
    ratingCount: 89,
    totalDeliveries: 215,
    totalEarnings: 52000,
  },
]

// Auto-seed: only runs if admin doesn't exist yet (safe to call on every boot)
async function autoSeed() {
  try {
    const adminExists = await User.findOne({ username: 'Ranjan1903' })
    if (adminExists) {
      console.log('Database already seeded — skipping')
      return
    }
    console.log('No admin found — seeding database...')
    await runSeed()
  } catch (err) {
    console.error('Auto-seed error:', err)
  }
}

async function seed() {
  try {
    await connectDB()
    await runSeed()
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

async function runSeed() {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Medicine.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
    ])
    console.log('Cleared existing data')

    // Create users
    const createdUsers = await User.create(users)
    console.log(`Created ${createdUsers.length} users`)

    // Create medicines
    const createdMeds = await Medicine.create(medicines)
    console.log(`Created ${createdMeds.length} medicines`)

    // Get customer and driver for sample orders
    const customer = createdUsers.find(u => u.role === 'customer')
    const driver = createdUsers.find(u => u.role === 'driver' && u.isVerified)

    // Create sample orders
    const sampleOrders = [
      {
        customer: customer._id,
        driver: driver._id,
        items: [
          { medicine: createdMeds[0]._id, name: createdMeds[0].name, brand: createdMeds[0].brand, image: createdMeds[0].image, price: createdMeds[0].price, mrp: createdMeds[0].mrp, qty: 2 },
          { medicine: createdMeds[2]._id, name: createdMeds[2].name, brand: createdMeds[2].brand, image: createdMeds[2].image, price: createdMeds[2].price, mrp: createdMeds[2].mrp, qty: 1 },
        ],
        subtotal: 101,
        deliveryFee: 0,
        discount: 5,
        total: 96,
        address: { label: 'Home', address: '42, Green Park, New Delhi - 110016' },
        paymentMethod: 'upi',
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        timeline: [
          { status: 'placed', label: 'Order Placed', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3600000) },
          { status: 'confirmed', label: 'Pharmacy Confirmed', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3000000) },
          { status: 'picked_up', label: 'Picked Up', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 2400000) },
          { status: 'out_for_delivery', label: 'Out for Delivery', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 1800000) },
          { status: 'delivered', label: 'Delivered', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        ],
        driverRating: 5,
        driverReview: 'Super fast delivery!',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3600000),
      },
      {
        customer: customer._id,
        driver: driver._id,
        items: [
          { medicine: createdMeds[5]._id, name: createdMeds[5].name, brand: createdMeds[5].brand, image: createdMeds[5].image, price: createdMeds[5].price, mrp: createdMeds[5].mrp, qty: 1 },
        ],
        subtotal: 199,
        deliveryFee: 29,
        discount: 9,
        total: 219,
        address: { label: 'Home', address: '42, Green Park, New Delhi - 110016' },
        paymentMethod: 'card',
        status: 'out_for_delivery',
        timeline: [
          { status: 'placed', label: 'Order Placed', time: new Date(Date.now() - 1800000) },
          { status: 'confirmed', label: 'Pharmacy Confirmed', time: new Date(Date.now() - 1200000) },
          { status: 'picked_up', label: 'Picked Up', time: new Date(Date.now() - 600000) },
          { status: 'out_for_delivery', label: 'Out for Delivery', time: new Date(Date.now() - 300000) },
        ],
        estimatedDelivery: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        customer: customer._id,
        items: [
          { medicine: createdMeds[11]._id, name: createdMeds[11].name, brand: createdMeds[11].brand, image: createdMeds[11].image, price: createdMeds[11].price, mrp: createdMeds[11].mrp, qty: 1 },
          { medicine: createdMeds[6]._id, name: createdMeds[6].name, brand: createdMeds[6].brand, image: createdMeds[6].image, price: createdMeds[6].price, mrp: createdMeds[6].mrp, qty: 3 },
        ],
        subtotal: 413,
        deliveryFee: 0,
        discount: 20,
        total: 393,
        address: { label: 'Office', address: 'Plot 7, Sector 44, Gurugram - 122003' },
        paymentMethod: 'cod',
        status: 'confirmed',
        timeline: [
          { status: 'placed', label: 'Order Placed', time: new Date(Date.now() - 900000) },
          { status: 'confirmed', label: 'Pharmacy Confirmed', time: new Date(Date.now() - 600000) },
        ],
        estimatedDelivery: new Date(Date.now() + 20 * 60 * 1000),
        createdAt: new Date(Date.now() - 900000),
      },
    ]

    // Create orders sequentially so the pre-save orderId counter increments correctly
    const createdOrders = []
    for (const o of sampleOrders) {
      createdOrders.push(await Order.create(o))
    }
    console.log(`Created ${createdOrders.length} sample orders`)

    console.log('\n=== Seed complete ===')
    console.log('Login credentials:')
    console.log('  Admin:    username: Ranjan1903  / Ranjan2002')
    console.log('  Customer: customer@medidrop.com / Customer@123')
    console.log('  Driver:   driver@medidrop.com   / Driver@123')
  } catch (err) {
    console.error('Seed error:', err)
    throw err
  }
}

module.exports = { autoSeed }

// Run directly: node seed.js
if (require.main === module) seed()
