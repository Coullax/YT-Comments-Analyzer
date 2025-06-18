'use client'

import {
  Button,
  VStack,
  Text,
  useToast,
  Box,
  Heading,
  Container,
} from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (status === 'loading') {
    return (
      <Container maxW="container.sm" py={10}>
        <VStack spacing={8}>
          <Text>Loading...</Text>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Welcome Back
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Sign in to analyze YouTube comments
          </Text>
        </Box>

        <Box
          w="full"
          p={8}
          borderRadius="lg"
          bg="white"
          shadow="base"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Text fontSize="lg">
              Get started with your Google account
            </Text>
            
            <Button
              w="full"
              size="lg"
              variant="outline"
              leftIcon={<FcGoogle />}
              onClick={handleSignIn}
              suppressHydrationWarning
            >
              Continue with Google
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
} 