import { useSession } from 'next-auth/react'
import { useToast } from '@chakra-ui/react'

export const handleSubscription = async (plan: string) => {
    
  try {
    const response = await fetch('http://localhost:3000/api/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    })

    if (!response.ok) {
      throw new Error('Failed to initiate subscription')
    }

    const data = await response.json()
    
    // Redirect to Stripe checkout
    if (data.url) {
      window.location.href = data.url
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to process subscription')
  }
} 