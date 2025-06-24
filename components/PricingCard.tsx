'use client'

import {
  Box,
  Button,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FaCheckCircle } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { handleSubscription } from '@/app/actions/subscription'
import { handleUnSubscription } from '@/app/actions/unsubscribe'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PricingCardProps {
  title: string
  price: string
  period?: string
  features: string[]
  buttonText: string
  isPopular?: boolean
  plan: string
  isDisabled?: boolean
  currentPlan?: string
}

export default function PricingCard({
  title,
  price,
  period = '',
  features,
  buttonText,
  isPopular = false,
  plan,
  isDisabled = false,
  currentPlan = 'free',
}: PricingCardProps) {
  const { data: session } = useSession()
  const toast = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const popularStyles = isPopular
    ? {
        transform: 'scale(1.05)',
        boxShadow: 'xl',
        borderColor: 'red.500',
      }
    : {}

  const isCurrentPlan = currentPlan === plan
  const isPro = currentPlan === 'pro'

  const handleClick = async () => {
    if (!session) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to manage subscriptions',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      // If user is Pro and clicking on Pro card, handle unsubscribe
      if (isPro && plan === 'pro') {
        // await handleUnSubscription()
        const res = await fetch('/api/unsubscribe', { method: 'POST' })
        const result = await res.json()
        if (result.success) {
          toast({
          title: 'Unsubscribed successfully',
          description: 'You will continue to have access to premium features until the end of your billing period.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to unsubscribe',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        
        // Refresh the page to update subscription status
        window.location.reload()
      } 
      // If user is Pro and clicking on Free card, handle unsubscribe (downgrade)
      else if (isPro && plan === 'free') {
        await handleUnSubscription()
        toast({
          title: 'Downgraded to Free',
          description: 'You will continue to have access to premium features until the end of your billing period.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        // Refresh the page to update subscription status
        window.location.reload()
      }
      // If user is Free and clicking on Pro card, handle upgrade
      else if (!isPro && plan === 'pro') {
        await handleSubscription(plan)
        toast({
          title: 'Subscription initiated',
          description: 'Please complete the payment process.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (isPro && plan === 'pro') return 'Unsubscribe'
    if (isPro && plan === 'free') return 'Downgrade'
    if (isCurrentPlan) return 'Current Plan'
    return buttonText
  }

  const getButtonColor = () => {
    if (isPro && plan === 'pro') return 'red'
    if (isPro && plan === 'free') return 'orange'
    if (isCurrentPlan) return 'gray'
    return isPopular ? 'red' : 'blue'
  }

  const getButtonVariant = () => {
    if (isPro && (plan === 'pro' || plan === 'free')) return 'outline'
    if (isCurrentPlan) return 'solid'
    return isPopular ? 'solid' : 'outline'
  }

  return (
    <Box
      bg={useColorModeValue('white', 'gray.700')}
      border="2px solid"
      borderColor={isCurrentPlan ? 'green.500' : isPopular ? 'red.500' : 'gray.200'}
      rounded="lg"
      p={6}
      position="relative"
      transition="all 0.2s"
      {...popularStyles}
    >
      {isCurrentPlan && (
        <Text
          position="absolute"
          top="-2"
          left="50%"
          transform="translateX(-50%)"
          bg="green.500"
          color="white"
          fontSize="sm"
          fontWeight="bold"
          px={3}
          py={1}
          rounded="full"
        >
          Current Plan
        </Text>
      )}

      {isPopular && !isCurrentPlan && (
        <Text
          position="absolute"
          top="-2"
          right="-2"
          bg="red.500"
          color="white"
          fontSize="sm"
          fontWeight="bold"
          px={3}
          py={1}
          rounded="full"
        >
          Popular
        </Text>
      )}

      <VStack spacing={4}>
        <Heading size="md">{title}</Heading>
        <Box>
          <Text fontSize="4xl" fontWeight="bold">
            {price}
          </Text>
          {period && (
            <Text fontSize="sm" color="gray.500">
              {period}
            </Text>
          )}
        </Box>

        <List spacing={3} w="full">
          {features.map((feature, index) => (
            <ListItem key={index}>
              <ListIcon as={FaCheckCircle} color="green.500" />
              {feature}
            </ListItem>
          ))}
        </List>

        <Button
          w="full"
          colorScheme={getButtonColor()}
          variant={getButtonVariant()}
          onClick={handleClick}
          isDisabled={isDisabled && isCurrentPlan}
          isLoading={isLoading}
          loadingText="Processing..."
        >
          {getButtonText()}
        </Button>
      </VStack>
    </Box>
  )
}