'use client'
import { useEffect, useRef, useState } from 'react'

export function usePayrollSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket('ws://localhost:3000/ws') // API gateway WebSocket endpoint
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            switch (data.type) {
              case 'payroll:status':
                // Update payroll run status
                console.log(`Payroll status update: ${data.id} - ${data.status}`)
                // Dispatch custom event for components to listen to
                window.dispatchEvent(new CustomEvent('payrollStatusUpdate', { detail: data }))
                break
                
              case 'transaction:confirmed':
                // Show success notification for confirmed transactions
                console.log(`Transaction confirmed: ${data.signature}`)
                window.dispatchEvent(new CustomEvent('transactionConfirmed', { detail: data }))
                break
                
              case 'transaction:failed':
                // Show error notification for failed transactions
                console.error(`Transaction failed: ${data.error}`)
                window.dispatchEvent(new CustomEvent('transactionFailed', { detail: data }))
                break
                
              default:
                console.log('Unknown WebSocket message:', data)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setIsConnected(false)
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...')
            connect()
          }, 3000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        setIsConnected(false)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  return { isConnected, sendMessage }
}
