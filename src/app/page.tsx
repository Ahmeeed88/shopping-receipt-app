'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Printer, Download, Lock, LogOut } from 'lucide-react'
import html2canvas from 'html2canvas'

interface ReceiptItem {
  id: string
  name: string
  quantity: number
  price: number
}

export default function ShoppingReceipt() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  // Main application state
  const [storeName, setStoreName] = useState('TOKO KELONTONG')
  const [storeAddress, setStoreAddress] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [cashierName, setCashierName] = useState('Kasir')
  const [receiptNumber, setReceiptNumber] = useState('001')
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', name: '', quantity: 1, price: 0 }
  ])
  const [paymentMethod, setPaymentMethod] = useState('Tunai')
  const [status, setStatus] = useState('Lunas')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Default password - you can change this
  const CORRECT_PASSWORD = 'admin123'

  // Check authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('isAuthenticated', 'true')
      setError('')
    } else {
      setError('Password salah! Silakan coba lagi.')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('isAuthenticated')
    setPassword('')
    setError('')
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Aplikasi Nota Belanja
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Masukkan password untuk mengakses aplikasi
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="mt-1"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            </form>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Password default: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin123</span></p>
              <p className="mt-1">Hubungi admin untuk password yang berbeda</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'name' ? value : Number(value) || 0 }
      }
      return item
    }))
  }

  const calculateSubtotal = (item: ReceiptItem) => {
    return item.quantity * item.price
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + calculateSubtotal(item), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    return `${day}-${month}-${year}`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getDayName = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return days[date.getDay()]
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveAsPNG = async () => {
    try {
      const receiptElement = document.getElementById('receipt')
      if (!receiptElement) {
        alert('Element receipt tidak ditemukan!')
        return
      }

      // Create a temporary container with white background
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.background = 'white'
      tempContainer.style.padding = '20px'
      
      // Clone the receipt element
      const clonedReceipt = receiptElement.cloneNode(true) as HTMLElement
      clonedReceipt.style.border = 'none'
      clonedReceipt.style.background = 'white'
      
      tempContainer.appendChild(clonedReceipt)
      document.body.appendChild(tempContainer)

      // Generate canvas from the cloned element
      const canvas = await html2canvas(clonedReceipt, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          
          // Generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
          const storeNameClean = (storeName || 'Nota').replace(/[^a-zA-Z0-9]/g, '_')
          link.download = `Nota_${storeNameClean}_${timestamp}.png`
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')

      // Clean up temporary container
      document.body.removeChild(tempContainer)
    } catch (error) {
      console.error('Error saving as PNG:', error)
      alert('Gagal menyimpan nota sebagai PNG. Silakan coba lagi.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center flex-1">Aplikasi Nota Belanja</h1>
          <Button onClick={handleLogout} variant="outline" className="no-print">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Buat Nota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Name */}
              <div>
                <Label htmlFor="storeName">Nama Toko</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Masukkan nama toko"
                />
              </div>

              {/* Store Address */}
              <div>
                <Label htmlFor="storeAddress">Alamat Toko (Opsional)</Label>
                <Input
                  id="storeAddress"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Masukkan alamat toko"
                />
              </div>

              {/* Store Phone */}
              <div>
                <Label htmlFor="storePhone">No. Telepon Toko (Opsional)</Label>
                <Input
                  id="storePhone"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="Masukkan nomor telepon toko"
                />
              </div>

              {/* Cashier Name */}
              <div>
                <Label htmlFor="cashierName">Nama Kasir</Label>
                <Input
                  id="cashierName"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Masukkan nama kasir"
                />
              </div>

              {/* Receipt Number */}
              <div>
                <Label htmlFor="receiptNumber">Nomor Nota</Label>
                <Input
                  id="receiptNumber"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Masukkan nomor nota"
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Daftar Barang</Label>
                  <Button onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Barang
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={item.id}>
                      {/* Desktop Layout */}
                      <div className="hidden sm:flex gap-2 items-center p-3 border rounded-lg">
                        <span className="text-sm font-medium w-8">{index + 1}.</span>
                        <Input
                          placeholder="Nama barang"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-20"
                          min="1"
                        />
                        <Input
                          type="number"
                          placeholder="Harga"
                          value={item.price || ''}
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          className="w-32"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Mobile Layout */}
                      <div className="sm:hidden p-3 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6">{index + 1}.</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Nama barang"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="flex-1"
                            min="1"
                          />
                          <Input
                            type="number"
                            placeholder="Harga"
                            value={item.price || ''}
                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                            className="flex-1"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="paymentMethod">Pembayaran Via</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                    <SelectItem value="Kartu Debit">Kartu Debit</SelectItem>
                    <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lunas">Lunas</SelectItem>
                    <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
                    <SelectItem value="DP">DP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Preview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Preview Nota</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAsPNG} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Simpan PNG
                  </Button>
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div id="receipt" className="bg-white p-6 border-2 border-dashed border-gray-300">
                {/* Receipt Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-2">{storeName || 'NAMA TOKO'}</h2>
                  {storeAddress && (
                    <p className="text-sm text-gray-600 mb-1">{storeAddress}</p>
                  )}
                  {storePhone && (
                    <p className="text-sm text-gray-600">Tel: {storePhone}</p>
                  )}
                </div>

                <Separator className="mb-4" />

                {/* Date and Time */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-left">
                      <div>No. Nota: <span className="font-bold">{receiptNumber || '001'}</span></div>
                      <div>Kasir: <span className="font-bold">{cashierName || '-'}</span></div>
                    </div>
                    <div className="text-right">
                      <div>{formatDate(currentTime)}</div>
                      <div>{formatTime(currentTime)}</div>
                    </div>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Items Table */}
                <div className="mb-4">
                  {/* Header - Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-12 text-xs font-bold mb-2">
                    <div className="col-span-1">No</div>
                    <div className="col-span-6">Barang</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Subtotal</div>
                  </div>
                  
                  {/* Header - Mobile Layout */}
                  <div className="sm:hidden text-xs font-bold mb-2">
                    <div className="flex justify-between items-center">
                      <span>Daftar Barang</span>
                    </div>
                  </div>
                  
                  <Separator className="mb-2" />

                  {/* Items - Desktop Layout */}
                  {items.filter(item => item.name).map((item, index) => (
                    <div key={item.id}>
                      <div className="hidden sm:grid grid-cols-12 text-xs mb-1">
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-6 truncate">{item.name}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-3 text-right">{formatCurrency(calculateSubtotal(item))}</div>
                      </div>
                      
                      {/* Items - Mobile Layout */}
                      <div className="sm:hidden text-xs mb-3 border-b border-gray-100 pb-2">
                        <div className="flex justify-between items-start">
                          <span className="font-medium flex-1">{index + 1}. {item.name}</span>
                          <span className="font-bold ml-2">{formatCurrency(calculateSubtotal(item))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="mb-4" />

                {/* Total */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Payment Info */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Pembayaran:</span>
                    <span>{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className={`font-bold ${status === 'Lunas' ? 'text-green-600' : status === 'Belum Lunas' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {status}
                    </span>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Cashier Info */}
                <div className="text-center">
                  <p className="text-xs mb-2">Terima Kasih</p>
                  <p className="text-xs mb-4">Selamat Berbelanja Kembali</p>
                  <div className="mt-6">
                    <p className="text-xs mb-1">Kasir:</p>
                    <p className="text-sm font-bold">{cashierName || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}