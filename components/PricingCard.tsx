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

interface PricingCardProps {
  title: string
  price: string
  period?: string
  features: string[]
  buttonText: string
  isPopular?: boolean
  plan: string
}

export default function PricingCard({
  title,
  price,
  period = '',
  features,
  buttonText,
  isPopular = false,
  plan,
}: PricingCardProps) {
  const { data: session } = useSession()
  const toast = useToast()
  
  const popularStyles = isPopular
    ? {
        transform: 'scale(1.05)',
        boxShadow: 'xl',
      }
    : {}

  const handleClick = async () => {
    if (!session) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to subscribe',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      await handleSubscription(plan)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      bg={useColorModeValue('white', 'gray.700')}
      border="1px solid"
      borderColor={isPopular ? 'red.500' : 'gray.200'}
      rounded="lg"
      p={6}
      position="relative"
      transition="all 0.2s"
      {...popularStyles}
    >
      {isPopular && (
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
          colorScheme={isPopular ? 'red' : 'gray'}
          variant={isPopular ? 'solid' : 'outline'}
          onClick={handleClick}
          suppressHydrationWarning
        >
          {buttonText}
        </Button>
      </VStack>
    </Box>
  )
} 