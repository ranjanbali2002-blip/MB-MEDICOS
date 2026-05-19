require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const connectDB = require('./config/db')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true,
  },
})

// Connect to MongoDB then auto-seed if needed
connectDB().then(() => {
  require('./seed').autoSeed()
})

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Inject io into req so routes can emit events
app.use((req, _res, next) => {
  req.io = io
  next()
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/medicines', require('./routes/medicines'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/users', require('./routes/users'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

// Socket.io
io.on('connection', (socket) => {
  // Customer joins their personal room for order updates
  socket.on('join_customer', (customerId) => {
    socket.join(`customer_${customerId}`)
  })

  // Join specific order room for live tracking
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`)
  })

  // Driver location updates
  socket.on('driver_location', ({ orderId, lat, lng }) => {
    io.to(`order_${orderId}`).emit('driver_location', { lat, lng })
  })

  socket.on('disconnect', () => {})
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`MediDrop server running on port ${PORT}`)
})
