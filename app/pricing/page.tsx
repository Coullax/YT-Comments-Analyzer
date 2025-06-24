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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PricingCard from '@/components/PricingCard'
import DashboardLayout from '@/components/DashboardLayout'

interface SubscriptionData {
  plan: string
  status: string
  currentPeriodEnd: string | null
  stripeSubscriptionId: string | null
  stripeCustomerId: string | null
}

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userSubscription, setUserSubscription] = React.useState<SubscriptionData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch user's subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (session?.user?.email) {
        try {
          setLoading(true)
          const response = await fetch('/api/user/getUserSubscriptionDetails')
          
          if (!response.ok) {
            throw new Error('Failed to fetch subscription data')
          }
          
          const data = await response.json()
          setUserSubscription(data)
          setError(null)
        } catch (error) {
          console.error('Error fetching subscription:', error)
          setError('Failed to load subscription data')
        } finally {
          setLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchSubscription()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8}>
            <Spinner size="xl" />
            <Text>Loading subscription details...</Text>
          </VStack>
        </Container>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxW="container.xl" py={10}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      </DashboardLayout>
    )
  }

  const isPro = userSubscription?.plan === 'pro'
  const isActivePro = isPro && userSubscription?.status === 'active'

  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="2xl" mb={4}>
              {isPro ? 'Manage Your Subscription' : 'Upgrade Your Plan'}
            </Heading>
            <Text fontSize="xl" color="gray.600">
              {isPro 
                ? 'You are currently on the Premium plan' 
                : 'Choose the plan that\'s right for you'
              }
            </Text>
            
            {isActivePro && userSubscription?.currentPeriodEnd && (
              <Text fontSize="md" color="gray.500" mt={2}>
                Your subscription renews on{' '}
                {new Date(userSubscription.currentPeriodEnd).toLocaleDateString()}
              </Text>
            )}
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
              buttonText={!isPro ? "Current Plan" : "Downgrade to Free"}
              isPopular={false}
              plan="free"
              isDisabled={!isPro}
              currentPlan={userSubscription?.plan || 'free'}
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
              buttonText={isPro ? "Unsubscribe" : "Upgrade Now"}
              isPopular={!isPro}
              plan="pro"
              isDisabled={false}
              currentPlan={userSubscription?.plan || 'free'}
            />
          </SimpleGrid>

          {isPro && (
            <Alert status="info" maxW="4xl">
              <AlertIcon />
              <Box>
                <AlertTitle>Premium Subscription Active!</AlertTitle>
                <AlertDescription>
                  You have access to all premium features. You can unsubscribe at any time and 
                  continue using premium features until the end of your billing period.
                </AlertDescription>
              </Box>
            </Alert>
          )}

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