'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Input,
  useToast,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Icon,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Center,
  Spinner,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Divider,
  useBreakpointValue,
  Flex,
  Spacer,
  chakra,
  // keyframes,
  usePrefersReducedMotion,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import AnalysisResult from '@/components/AnalysisResult'
import { 
  MdVideoLibrary, 
  MdAnalytics, 
  MdTrendingUp, 
  MdInsights,
  MdPlayCircleFilled,
  MdSpeed,
  MdSecurity,
  MdCloud
} from 'react-icons/md'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

interface AnalysisResponse {
  id: string
  comments: Array<{
    text: string
    author: string
    likes: number
    sentiment: {
      polarity: number
      subjectivity: number
    }
  }>
  statistics: {
    total_comments: number
    total_likes: number
    average_likes: number
    fetched_comments: number
  }
  sentiment_visualization: string
  visualizations: any
  ai_analysis: any
  gemini_analysis: {
    sentiment_distribution: {
      positive: number
      neutral: number
      negative: number
    }
    comment_categories: {
      questions: number
      praise: number
      suggestions: number
      complaints: number
      general: number
    }
    engagement_metrics: {
      high_engagement: number
      medium_engagement: number
      low_engagement: number
    }
    key_topics: Array<{
      topic: string
      count: number
    }>
    overall_analysis: {
      sentiment: string
      engagement_level: string
      community_health: string
    }
    recommendations: string[]
  }
}

interface ErrorResponse {
  error: string
  upgradeRequired?: boolean
}

const MotionBox = motion(Box)
const MotionCard = motion(Card)

// Animations
// const float = keyframes`
//   0% { transform: translateY(0px) }
//   50% { transform: translateY(-10px) }
//   100% { transform: translateY(0px) }
// `

// const pulse = keyframes`
//   0% { transform: scale(1) }
//   50% { transform: scale(1.05) }
//   100% { transform: scale(1) }
// `

const GlassmorphicCard = ({ children, ...props }: any) => (
  <Card
    bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)')}
    backdropFilter="blur(20px)"
    borderWidth="1px"
    borderColor={useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')}
    shadow="2xl"
    borderRadius="2xl"
    overflow="hidden"
    position="relative"
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      bgGradient: 'linear(to-r, transparent, rgba(255,255,255,0.4), transparent)',
    }}
    {...props}
  >
    {children}
  </Card>
)

const FeatureCard = ({ icon, title, description, color }: {
  icon: any
  title: string
  description: string
  color: string
}) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <MotionCard
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: prefersReducedMotion ? 0 : -5, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5 }}
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl"
      shadow="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
    >
      <CardBody p={6}>
        <VStack align="center" spacing={4}>
          <Box
            p={3}
            borderRadius="full"
            bgGradient={color}
            color="white"
            shadow="lg"
          >
            <Icon as={icon} boxSize={8} />
          </Box>
          <VStack spacing={2} textAlign="center">
            <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
              {title}
            </Text>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} lineHeight="1.5">
              {description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  )
}

const LoadingAnimation = () => (
  <Center py={12}>
    <VStack spacing={6}>
      <Box position="relative">
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.8s"
          emptyColor="gray.200"
          color="blue.500"
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Icon as={MdAnalytics} boxSize={6} color="blue.500" />
        </Box>
      </Box>
      <VStack spacing={2} textAlign="center">
        <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.300')}>
          Analyzing your video...
        </Text>
        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.500')}>
          This may take a few moments
        </Text>
      </VStack>
    </VStack>
  </Center>
)

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [analysisId, setAnalysisId] = useState('')
  const [userSubscription, setUserSubscription] = useState<{ plan: string } | null>(null)
  const { data: session, status } = useSession()
  const toast = useToast()
  const router = useRouter()
  
  const bgGradient = useColorModeValue(
    'linear(135deg, #667eea 0%, #764ba2 100%)',
    'linear(135deg, #1a202c 0%, #2d3748 100%)'
  )
  
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Fetch user's subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/subscription', {
            method: 'POST',
          })
          const data = await response.json()
          setUserSubscription(data)
        } catch (error) {
          console.error('Error fetching subscription:', error)
        }
      }
    }
    fetchSubscription()
  }, [session])

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a valid YouTube URL',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const newAnalysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: url.trim(),
          analysis_id: newAnalysisId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze video')
      }

      const responseData: AnalysisResponse = data
      setResult(responseData)
      setAnalysisId(responseData?.id)
      
      toast({
        title: 'Analysis Complete! 🎉',
        description: 'Your video analysis is ready',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze video'
      setError({
        error: errorMessage,
        upgradeRequired: errorMessage.includes('upgrade to PRO')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <Box
        minH="100vh"
        bgGradient={bgGradient}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      >
        <Container maxW="7xl" py={8}>
          <VStack spacing={10} align="stretch">
            {/* Hero Section */}
            <Box textAlign="center" py={8}>
              <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <chakra.h1
                  fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                  fontWeight="bold"
                  color="white"
                  mb={4}
                  textShadow="2xl"
                  bgGradient="linear(to-r, white, whiteAlpha.800)"
                  bgClip="text"
                >
                  Analyze YouTube Comments
                </chakra.h1>
                <Text 
                  fontSize={{ base: 'lg', md: 'xl' }} 
                  color="whiteAlpha.800" 
                  maxW="3xl" 
                  mx="auto"
                  lineHeight="1.6"
                >
                  Get AI-powered insights and sentiment analysis from your video comments. 
                  Understand your audience better with advanced analytics.
                </Text>
              </MotionBox>
            </Box>

            {/* Analysis Form */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassmorphicCard maxW="4xl" mx="auto">
                <CardBody p={8}>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={6}>
                      <FormControl>
                        <FormLabel 
                          fontSize="lg" 
                          fontWeight="bold" 
                          color={useColorModeValue('gray.700', 'white')}
                          mb={3}
                        >
                          <HStack spacing={2}>
                            <Icon as={MdVideoLibrary} color="red.500" />
                            <Text>YouTube Video URL</Text>
                          </HStack>
                        </FormLabel>
                        <HStack spacing={4}>
                          <InputGroup size="lg" flex={1}>
                            <InputLeftElement pointerEvents="none" pl={2}>
                              <Icon as={MdVideoLibrary} color="red.500" boxSize={5} />
                            </InputLeftElement>
                            <Input
                              type="url"
                              placeholder="https://www.youtube.com/watch?v=..."
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              isDisabled={loading}
                              bg={useColorModeValue('white', 'gray.700')}
                              border="2px solid"
                              borderColor={useColorModeValue('gray.200', 'gray.600')}
                              _focus={{ 
                                borderColor: 'red.500',
                                boxShadow: '0 0 0 1px rgba(245, 101, 101, 0.6)',
                                bg: useColorModeValue('white', 'gray.700')
                              }}
                              _hover={{
                                borderColor: useColorModeValue('gray.300', 'gray.500')
                              }}
                              fontSize="md"
                              borderRadius="xl"
                              pl={12}
                              py={6}
                            />
                          </InputGroup>
                          <Button
                            type="submit"
                            size="lg"
                            isLoading={loading}
                            loadingText="Analyzing..."
                            bg="linear-gradient(135deg, #FF0000 0%, #CC0000 100%)"
                            color="white"
                            borderRadius="xl"
                            fontWeight="bold"
                            px={8}
                            py={6}
                            minW={isMobile ? "full" : "150px"}
                            shadow="lg"
                            _hover={{
                              transform: 'translateY(-2px)',
                              shadow: 'xl',
                            }}
                            _active={{
                              transform: 'translateY(0)',
                            }}
                            transition="all 0.2s"
                            leftIcon={!loading ? <MdPlayCircleFilled /> : undefined}
                          >
                            {isMobile ? "Analyze" : "🚀 Analyze"}
                          </Button>
                        </HStack>
                      </FormControl>
                    </VStack>
                  </form>
                </CardBody>
              </GlassmorphicCard>
            </MotionBox>

            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassmorphicCard>
                    <CardBody>
                      <LoadingAnimation />
                    </CardBody>
                  </GlassmorphicCard>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
              {error && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    status={error.upgradeRequired ? 'warning' : 'error'}
                    borderRadius="xl"
                    bg={error.upgradeRequired ? 'orange.50' : 'red.50'}
                    border="1px solid"
                    borderColor={error.upgradeRequired ? 'orange.200' : 'red.200'}
                    p={6}
                  >
                    <AlertIcon boxSize={6} />
                    <Box flex={1}>
                      <AlertTitle fontSize="lg" mb={2}>
                        {error.upgradeRequired ? 'Upgrade Required' : 'Analysis Failed'}
                      </AlertTitle>
                      <AlertDescription fontSize="md" mb={4}>
                        {error.error}
                      </AlertDescription>
                      {error.upgradeRequired && userSubscription?.plan !== 'pro' && (
                        <Button
                          colorScheme="orange"
                          size="sm"
                          onClick={() => router.push('/pricing')}
                          borderRadius="lg"
                        >
                          Upgrade to PRO
                        </Button>
                      )}
                    </Box>
                  </Alert>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Features Showcase - Only show when no result */}
            <AnimatePresence>
              {!result && !loading && !error && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <VStack spacing={8}>
                    <Box textAlign="center">
                      <Heading 
                        size="xl" 
                        color="white" 
                        mb={4}
                        textShadow="lg"
                      >
                        Discover What's Possible
                      </Heading>
                      <Text 
                        fontSize="lg" 
                        color="whiteAlpha.800" 
                        maxW="2xl" 
                        mx="auto"
                      >
                        Transform your YouTube comments into actionable insights with our AI-powered analysis
                      </Text>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                      <FeatureCard
                        icon={MdInsights}
                        title="Sentiment Analysis"
                        description="Understand the emotional tone and reaction of your audience to your content"
                        color="linear(135deg, #667eea 0%, #764ba2 100%)"
                      />
                      <FeatureCard
                        icon={MdAnalytics}
                        title="Engagement Metrics"
                        description="Discover which topics generate the most discussion and audience interaction"
                        color="linear(135deg, #56ab2f 0%, #a8e6cf 100%)"
                      />
                      <FeatureCard
                        icon={MdTrendingUp}
                        title="AI Recommendations"
                        description="Get personalized suggestions to improve your content and grow your channel"
                        color="linear(135deg, #8360c3 0%, #2ebf91 100%)"
                      />
                      <FeatureCard
                        icon={MdSpeed}
                        title="Instant Results"
                        description="Get comprehensive analysis in seconds with our advanced AI processing"
                        color="linear(135deg, #ff6b6b 0%, #feca57 100%)"
                      />
                    </SimpleGrid>

                    {/* CTA Section */}
                    <GlassmorphicCard w="full" maxW="3xl">
                      <CardBody p={8} textAlign="center">
                        <VStack spacing={4}>
                          <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
                            Ready to Get Started?
                          </Heading>
                          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="md">
                            Paste any YouTube video URL above and click "Analyze" to see the magic happen!
                          </Text>
                          <HStack spacing={4} justify="center" flexWrap="wrap">
                            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                              <HStack spacing={1}>
                                <Icon as={MdSecurity} boxSize={3} />
                                <Text fontSize="xs">Secure</Text>
                              </HStack>
                            </Badge>
                            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                              <HStack spacing={1}>
                                <Icon as={MdSpeed} boxSize={3} />
                                <Text fontSize="xs">Fast</Text>
                              </HStack>
                            </Badge>
                            <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                              <HStack spacing={1}>
                                <Icon as={MdCloud} boxSize={3} />
                                <Text fontSize="xs">AI-Powered</Text>
                              </HStack>
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </GlassmorphicCard>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && !loading && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AnalysisResult
                    comments={result.comments || []}
                    statistics={result.statistics || { 
                      total_comments: 0, 
                      total_likes: 0, 
                      average_likes: 0, 
                      fetched_comments: 0 
                    }}
                    visualizations={result.visualizations || {}}
                    ai_analysis={result.ai_analysis || {
                      sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
                      comment_categories: { questions: 0, praise: 0, suggestions: 0, complaints: 0, general: 0 },
                      engagement_metrics: { high_engagement: 0, medium_engagement: 0, low_engagement: 0 },
                      key_topics: [],
                      overall_analysis: { 
                        sentiment: 'Not available', 
                        engagement_level: 'Not available', 
                        community_health: 'Not available' 
                      },
                      recommendations: [],
                      positiveInsights: [],
                      futureImprovementsSuggests: [],
                    }}
                    analysisId={result.id || analysisId}
                  />
                </MotionBox>
              )}
            </AnimatePresence>
          </VStack>
        </Container>
      </Box>
    </DashboardLayout>
  )
}