'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  Wallet,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Download,
  Eye
} from 'lucide-react'

interface PayrollHistory {
  id: string;
  date: string;
  amount: number;
  token: 'SOL' | 'USDC';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  signature?: string;
  description: string;
}

interface Transaction {
  id: string;
  type: 'PAYROLL' | 'BONUS' | 'ADJUSTMENT';
  amount: number;
  token: 'SOL' | 'USDC';
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  signature?: string;
  description: string;
}

interface KYCStatus {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  submittedAt?: string;
  verifiedAt?: string;
  documents: string[];
}

export default function EmployeePortal() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistory[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    status: 'NOT_SUBMITTED',
    documents: []
  })
  const [walletBalance, setWalletBalance] = useState<{ SOL: number; USDC: number }>({
    SOL: 0,
    USDC: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated || !user) {
        router.replace('/login')
        return
      }
      fetchEmployeeData()
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true)

      // Mock data
      const mockPayrollHistory: PayrollHistory[] = [
        {
          id: 'pay-001',
          date: '2024-01-15T09:00:00Z',
          amount: 5000,
          token: 'USDC',
          status: 'CONFIRMED',
          signature: '5K7...abc',
          description: 'Monthly salary - January 2024'
        },
        {
          id: 'pay-002',
          date: '2024-01-01T09:00:00Z',
          amount: 5000,
          token: 'USDC',
          status: 'CONFIRMED',
          signature: '3M2...def',
          description: 'Monthly salary - December 2023'
        },
        {
          id: 'pay-003',
          date: '2024-01-20T09:00:00Z',
          amount: 1000,
          token: 'USDC',
          status: 'PENDING',
          description: 'Performance bonus'
        }
      ]

      const mockTransactions: Transaction[] = [
        {
          id: 'tx-001',
          type: 'PAYROLL',
          amount: 5000,
          token: 'USDC',
          timestamp: '2024-01-15T09:00:00Z',
          status: 'CONFIRMED',
          signature: '5K7...abc',
          description: 'Monthly salary'
        },
        {
          id: 'tx-002',
          type: 'BONUS',
          amount: 1000,
          token: 'USDC',
          timestamp: '2024-01-20T09:00:00Z',
          status: 'PENDING',
          description: 'Performance bonus'
        },
        {
          id: 'tx-003',
          type: 'ADJUSTMENT',
          amount: -200,
          token: 'USDC',
          timestamp: '2024-01-18T14:30:00Z',
          status: 'CONFIRMED',
          signature: '7N9...ghi',
          description: 'Tax adjustment'
        }
      ]

      const mockKycStatus: KYCStatus = {
        status: 'VERIFIED',
        submittedAt: '2024-01-10T10:00:00Z',
        verifiedAt: '2024-01-12T15:30:00Z',
        documents: ['passport.pdf', 'drivers_license.pdf', 'bank_statement.pdf']
      }

      const mockWalletBalance = {
        SOL: 2.5,
        USDC: 12500
      }

      setTimeout(() => {
        setPayrollHistory(mockPayrollHistory)
        setTransactions(mockTransactions)
        setKycStatus(mockKycStatus)
        setWalletBalance(mockWalletBalance)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch employee data:', error)
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'VERIFIED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FAILED':
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'VERIFIED':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'FAILED':
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString()} ${token}`
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5eead4]"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5eead4]"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#09090b] p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Employee Portal</h1>
          <p className="text-[#71717a]">Welcome back, {user?.name || 'Employee'}</p>
        </div>

        {/* Wallet Balance & KYC Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#71717a] flex items-center">
                <Wallet className="w-4 h-4 mr-2 text-[#5eead4]" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#fafafa]">
                  {walletBalance.SOL} SOL
                </div>
                <div className="text-lg text-[#71717a]">
                  {formatAmount(walletBalance.USDC, 'USDC')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#71717a] flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#0ea5e9]" />
                KYC Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(kycStatus.status)}
                <Badge className={getStatusColor(kycStatus.status)}>
                  {kycStatus.status}
                </Badge>
              </div>
              {kycStatus.verifiedAt && (
                <p className="text-xs text-[#71717a] mt-1">
                  Verified: {formatDate(kycStatus.verifiedAt)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#71717a] flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-[#5eead4]" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fafafa]">
                {formatAmount(
                  payrollHistory
                    .filter(p => p.status === 'CONFIRMED')
                    .reduce((sum, p) => sum + p.amount, 0),
                  'USDC'
                )}
              </div>
              <p className="text-xs text-[#71717a]">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payroll History */}
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader>
              <CardTitle className="text-[#fafafa] flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#5eead4]" />
                Payroll History
              </CardTitle>
              <CardDescription className="text-[#71717a]">
                Your salary payments and bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollHistory.map((payroll) => (
                  <motion.div
                    key={payroll.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-3 bg-[#09090b] rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[#fafafa] font-medium">
                          {formatAmount(payroll.amount, payroll.token)}
                        </span>
                        <Badge className={getStatusColor(payroll.status)}>
                          {payroll.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#71717a]">{payroll.description}</p>
                      <p className="text-xs text-[#52525b]">{formatDate(payroll.date)}</p>
                    </div>
                    <div className="flex space-x-2">
                      {payroll.signature && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://explorer.solana.com/tx/${payroll.signature}`, '_blank')}
                          className="border-[#27272a] text-[#fafafa] hover:bg-[#27272a]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const content = `Payroll Receipt\n\nID: ${payroll.id}\nDate: ${formatDate(payroll.date)}\nAmount: ${formatAmount(payroll.amount, payroll.token)}\nStatus: ${payroll.status}\nDescription: ${payroll.description}${payroll.signature ? `\nTransaction: ${payroll.signature}` : ''}`
                          const blob = new Blob([content], { type: 'text/plain' })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `payroll-${payroll.id}.txt`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          window.URL.revokeObjectURL(url)
                        }}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader>
              <CardTitle className="text-[#fafafa] flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#0ea5e9]" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-[#71717a]">
                All wallet transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-3 bg-[#09090b] rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`font-medium ${tx.amount < 0 ? 'text-red-400' : 'text-[#5eead4]'}`}>
                          {tx.amount < 0 ? '' : '+'}{formatAmount(Math.abs(tx.amount), tx.token)}
                        </span>
                        <Badge className="bg-[#0ea5e9]/20 text-[#0ea5e9] border-[#0ea5e9]/30">
                          {tx.type}
                        </Badge>
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#71717a]">{tx.description}</p>
                      <p className="text-xs text-[#52525b]">{formatDate(tx.timestamp)}</p>
                    </div>
                    <div className="flex space-x-2">
                      {tx.signature && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://explorer.solana.com/tx/${tx.signature}`, '_blank')}
                          className="border-[#27272a] text-[#fafafa] hover:bg-[#27272a]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
