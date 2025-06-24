'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { 
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Spinner,
  Icon,
  Circle,
  Progress,
  useColorModeValue,
  Fade,
  ScaleFade,
  useToast
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FaCheckCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa'

const pulseRing = keyframes`
  0% {
    transform: scale(0.33);
  }
  40%,
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
`

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const toast = useToast()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  )
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setStatus('error')
      setMessage('No session ID found. Please try again or contact support.')
      return
    }

    // Verify the session and update subscription
    fetch('/api/verify-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error)
        }
        setStatus('success')
        setMessage('Your subscription has been activated successfully!')
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              router.push('/dashboard')
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      })
      .catch((error) => {
        setStatus('error')
        setMessage(error.message || 'Something went wrong. Please try again.')
        toast({
          title: 'Subscription Error',
          description: error.message || 'Failed to activate subscription',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }, [searchParams, router, toast])

  const LoadingState = () => (
    <VStack spacing={6}>
      <Box position="relative">
        <Circle
          size="80px"
          bg="blue.500"
          position="relative"
          _before={{
            content: "''",
            display: 'block',
            position: 'absolute',
            width: '300%',
            height: '300%',
            boxSizing: 'border-box',
            marginLeft: '-100%',
            marginTop: '-100%',
            borderRadius: '50%',
            bgColor: 'blue.400',
            animation: `2.25s ${pulseRing} cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
          }}
        >
          <Spinner size="xl" color="white" thickness="4px" />
        </Circle>
      </Box>
      
      <VStack spacing={3}>
        <Heading size="lg" textAlign="center">
          Processing your subscription...
        </Heading>
        <Text color={textColor} textAlign="center" fontSize="md">
          Please wait while we activate your premium features
        </Text>
        <Progress 
          size="sm" 
          isIndeterminate 
          colorScheme="blue" 
          width="200px" 
          borderRadius="full"
        />
      </VStack>
    </VStack>
  )

  const SuccessState = () => (
    <ScaleFade initialScale={0.5} in={status === 'success'}>
      <VStack spacing={6}>
        <Box position="relative">
          <Circle
            size="100px"
            bg="green.500"
            color="white"
            animation={`${bounce} 1s ease infinite`}
            _before={{
              content: "''",
              display: 'block',
              position: 'absolute',
              width: '300%',
              height: '300%',
              boxSizing: 'border-box',
              marginLeft: '-100%',
              marginTop: '-100%',
              borderRadius: '50%',
              bgColor: 'green.400',
              animation: `2.25s ${pulseRing} cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
            }}
          >
            <Icon as={FaCheckCircle} boxSize={12} />
          </Circle>
        </Box>

        <VStack spacing={4} textAlign="center">
          <Heading size="xl" color="green.500">
            Payment Successful! 🎉
          </Heading>
          <Text color={textColor} fontSize="lg" maxW="400px">
            {message}
          </Text>
          
          <Box 
            bg={useColorModeValue('green.50', 'green.900')} 
            p={4} 
            borderRadius="lg" 
            border="1px solid"
            borderColor={useColorModeValue('green.200', 'green.700')}
            width="100%"
          >
            <VStack spacing={2}>
              <Text fontWeight="semibold" color="green.600">
                Welcome to Premium! ✨
              </Text>
              <Text fontSize="sm" color={textColor}>
                You now have access to unlimited analyses, advanced insights, and priority support.
              </Text>
            </VStack>
          </Box>

          <VStack spacing={2}>
            <Text fontSize="sm" color={textColor}>
              Redirecting to dashboard in {countdown} seconds...
            </Text>
            <Progress 
              value={(5 - countdown) * 20} 
              size="sm" 
              colorScheme="green" 
              width="200px"
              borderRadius="full"
            />
          </VStack>

          <Button
            colorScheme="green"
            size="lg"
            rightIcon={<FaArrowRight />}
            onClick={() => router.push('/dashboard')}
            width="200px"
          >
            Go to Dashboard
          </Button>
        </VStack>
      </VStack>
    </ScaleFade>
  )

  const ErrorState = () => (
    <Fade in={status === 'error'}>
      <VStack spacing={6}>
        <Circle size="100px" bg="red.500" color="white">
          <Icon as={FaExclamationTriangle} boxSize={12} />
        </Circle>

        <VStack spacing={4} textAlign="center">
          <Heading size="xl" color="red.500">
            Oops! Something went wrong
          </Heading>
          <Text color={textColor} fontSize="lg" maxW="400px">
            {message}
          </Text>
          
          <Box 
            bg={useColorModeValue('red.50', 'red.900')} 
            p={4} 
            borderRadius="lg" 
            border="1px solid"
            borderColor={useColorModeValue('red.200', 'red.700')}
            width="100%"
          >
            <VStack spacing={2}>
              <Text fontWeight="semibold" color="red.600">
                Need help?
              </Text>
              <Text fontSize="sm" color={textColor} textAlign="center">
                If you were charged but didn't receive access, please contact our support team.
                We'll resolve this quickly for you.
              </Text>
            </VStack>
          </Box>

          <VStack spacing={3}>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => router.push('/dashboard')}
              width="200px"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
              size="md"
              onClick={() => router.push('/contact')}
            >
              Contact Support
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </Fade>
  )

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md">
        <Box
          bg={cardBg}
          p={8}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
          backdropFilter="blur(10px)"
        >
          {status === 'loading' && <LoadingState />}
          {status === 'success' && <SuccessState />}
          {status === 'error' && <ErrorState />}
        </Box>
      </Container>
    </Box>
  )
}