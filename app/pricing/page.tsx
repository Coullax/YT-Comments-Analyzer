'use client'

import React, { useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PricingCard from '@/components/PricingCard'
import DashboardLayout from '@/components/DashboardLayout'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userSubscription, setUserSubscription] = React.useState<{ plan: string } | null>(null)

  // Fetch user's subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/subscription')
          const data = await response.json()
          setUserSubscription(data)
          
          // Redirect PRO users back to dashboard
          if (data.plan === 'pro') {
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error fetching subscription:', error)
        }
      }
    }
    fetchSubscription()
  }, [session, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="2xl" mb={4}>
              Upgrade Your Plan
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Choose the plan that's right for you
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full" maxW="4xl">
            <PricingCard
              title="Free"
              price="$0"
              features={[
                'One-time analysis',
                'Basic sentiment analysis',
                'Top comments overview',
                'Limited API calls'
              ]}
              buttonText="Current Plan"
              isPopular={false}
              plan="free"
              isDisabled={true}
            />
            <PricingCard
              title="Premium"
              price="$9.99"
              period="/month"
              features={[
                'Unlimited analyses',
                'Advanced sentiment analysis',
                'Detailed insights',
                'Priority support',
                'No ads'
              ]}
              buttonText="Upgrade Now"
              isPopular={true}
              plan="pro"
            />
          </SimpleGrid>

          <Box maxW="xl" textAlign="center" mt={8}>
            <Text fontSize="lg" color="gray.600">
              Need more information? Check out our{' '}
              <Text as="span" color="blue.500" cursor="pointer" onClick={() => router.push('/faq')}>
                FAQ
              </Text>{' '}
              or{' '}
              <Text as="span" color="blue.500" cursor="pointer" onClick={() => router.push('/contact')}>
                contact us
              </Text>
              .
            </Text>
          </Box>
        </VStack>
      </Container>
    </DashboardLayout>
  )
} 