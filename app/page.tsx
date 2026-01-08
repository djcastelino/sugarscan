'use client'

import { useState } from 'react'
import { Camera, Search, AlertCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react'

export default function Home() {
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

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
        {/* Scan Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Scan Product Barcode
          </h2>
          
          <div className="flex gap-2">
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

          <p className="text-xs text-gray-500 mt-2">
            Try: 737628064502 (Trader Joe's Pad Thai), 041520893164 (Clif Bar), or 0016000119178
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Product Not Found</h3>
                    <p className="text-red-700 text-sm mt-1">{result.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Product Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.productName}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{result.productName}</h3>
                      {result.brands && (
                        <p className="text-gray-600 mt-1">{result.brands}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {result.servingSize}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          {result.calories} cal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sugar Analysis */}
                {(() => {
                  const rating = getSugarRating(result.sugarLevel)
                  const Icon = rating.icon
                  return (
                    <div className={`${rating.bg} border-2 ${rating.color} border-current rounded-2xl p-6`}>
                      <div className="flex items-start gap-3">
                        <Icon className={`w-7 h-7 ${rating.color} mt-0.5`} />
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold ${rating.color}`}>
                            {result.sugarLevel} Sugar Content
                          </h3>
                          <p className={`text-lg font-semibold mt-2 ${rating.color}`}>
                            {result.sugarsPerServing}
                          </p>
                          <p className="text-sm text-gray-700 mt-2">{result.sugarContext}</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* AI Recommendation */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-3">AI Health Analysis</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {result.aiRecommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                {result.alternatives && result.alternatives.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Healthier Alternatives
                    </h3>
                    <div className="space-y-3">
                      {result.alternatives.map((alt: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                          <p className="text-gray-700 flex-1">{alt}</p>
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
        {!result && (
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Instant Analysis</h3>
              <p className="text-sm text-gray-600">Get detailed sugar content breakdown in seconds</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Powered</h3>
              <p className="text-sm text-gray-600">Smart recommendations based on your scan</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">✨ Better Choices</h3>
              <p className="text-sm text-gray-600">Discover healthier alternatives instantly</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
        <p>Powered by OpenFoodFacts, USDA FoodData Central, and AI</p>
      </footer>
    </div>
  )
}
