'use client'

import { useState, useEffect } from 'react'
import { Camera, Search, AlertCircle, CheckCircle, XCircle, Sparkles, X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

export default function Home() {
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)

  useEffect(() => {
    if (showScanner && !html5QrCode) {
      const qrCode = new Html5Qrcode("reader")
      setHtml5QrCode(qrCode)
    }

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {})
      }
    }
  }, [showScanner])

  const startScanner = async () => {
    if (!html5QrCode) return

    try {
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setBarcode(decodedText)
          stopScanner()
        },
        () => {} // Ignore errors during scanning
      )
    } catch (err) {
      console.error("Error starting scanner:", err)
      alert("Camera access denied or not available. Please enter barcode manually.")
      setShowScanner(false)
    }
  }

  const stopScanner = () => {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        setShowScanner(false)
      }).catch(() => {})
    }
  }

  useEffect(() => {
    if (showScanner && html5QrCode) {
      startScanner()
    }
  }, [showScanner, html5QrCode])

  const handleScan = async () => {
    if (!barcode.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('https://workflowly.online/webhook/sugarscan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: barcode.trim() })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to analyze product' })
    } finally {
      setLoading(false)
    }
  }

  const getSugarRating = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle }
      case 'moderate': return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertCircle }
      case 'high': return { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle }
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertCircle }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SugarScan
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-14">Know what you eat, powered by AI</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scan Barcode</h3>
                <button
                  onClick={stopScanner}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div id="reader" className="w-full"></div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Point your camera at the product barcode
              </p>
            </div>
          </div>
        )}

        {/* Scan Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Scan Product Barcode
          </h2>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Enter barcode (e.g., 737628064502)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
            />
            <button
              onClick={handleScan}
              disabled={loading || !barcode.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Scan
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowScanner(true)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Camera className="w-5 h-5" />
            Use Camera Scanner
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Try: 737628064502 (Trader Joe's Pad Thai), 041520893164 (Clif Bar)
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            {result.error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{result.error}</p>
              </div>
            ) : (
              <>
                {/* Product Header */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {result.productName}
                  </h3>
                  <p className="text-gray-600">{result.brand}</p>
                </div>

                {/* Sugar Rating */}
                {result.sugarLevel && (
                  <div className={`${getSugarRating(result.sugarLevel).bg} rounded-xl p-6 mb-6`}>
                    <div className="flex items-center gap-3 mb-3">
                      {(() => {
                        const Icon = getSugarRating(result.sugarLevel).icon
                        return <Icon className={`w-8 h-8 ${getSugarRating(result.sugarLevel).color}`} />
                      })()}
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Sugar Level</p>
                        <p className={`text-2xl font-bold ${getSugarRating(result.sugarLevel).color} capitalize`}>
                          {result.sugarLevel}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{result.sugarPerServing}</p>
                  </div>
                )}

                {/* AI Analysis */}
                {result.aiAnalysis && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">AI Analysis</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {result.aiAnalysis}
                    </p>
                  </div>
                )}

                {/* Healthier Alternatives */}
                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Healthier Alternatives
                    </h4>
                    <div className="space-y-3">
                      {result.alternatives.map((alt: string, idx: number) => (
                        <div
                          key={idx}
                          className="bg-green-50 rounded-lg p-4 border border-green-100"
                        >
                          <p className="text-gray-700">{alt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
            <p className="text-sm text-gray-600">
              Scan or enter a product barcode. Our AI analyzes sugar content and provides personalized health insights.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Data Sources</h3>
            <p className="text-sm text-gray-600">
              Powered by OpenFoodFacts, USDA FoodData, and AI analysis for accurate nutritional information.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
