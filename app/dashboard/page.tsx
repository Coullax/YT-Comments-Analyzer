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
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import AnalysisResult from '@/components/AnalysisResult'
import { MdVideoLibrary } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

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
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  // Fetch user's subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/subscription')
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
        title: 'Error',
        description: 'Please enter a YouTube URL',
        status: 'error',
        duration: 3000,
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
      debugger;
      setResult(responseData)
      setAnalysisId(responseData?.id)
    } catch (error) {
      console.error('Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze video'
      setError({
        error: errorMessage,
        upgradeRequired: errorMessage.includes('upgrade to PRO')
      })
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Analyze YouTube Comments
          </Heading>
          <Text color="gray.600">
            Get AI-powered insights from your video comments
          </Text>
        </Box>

        <Card boxShadow="lg" borderRadius="xl" bg="white" p={2} w="full" maxW="3xl" alignSelf="center">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel fontWeight="bold" color="#FF0000" fontSize="lg">
                    <Icon as={MdVideoLibrary} color="#FF0000" mr={2} />
                    YouTube Video URL
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={MdVideoLibrary} color="#FF0000" boxSize={6} />
                    </InputLeftElement>
                    <Box display="flex" w="100%" gap={2}>
                      <Input
                        type="url"
                        name="videoUrl"
                        placeholder="Paste a YouTube video URL..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        isDisabled={loading}
                        bgGradient="linear(to-r, #FFF, #F9F9F9)"
                        borderColor="#FF0000"
                        _focus={{ borderColor: '#FF0000', boxShadow: '0 0 0 2px #FF0000' }}
                        fontSize="md"
                        fontWeight={500}
                        borderRadius="md"
                        pl={12}
                        py={6}
                        transition="box-shadow 0.2s"
                        flex={1}
                      />
                      <Button
                        type="submit"
                        bg="#FF0000"
                        color="white"
                        isLoading={loading}
                        loadingText="Analyzing..."
                        size="lg"
                        borderRadius="md"
                        fontWeight={700}
                        boxShadow="0 2px 8px rgba(255,0,0,0.10)"
                        _hover={{ bg: '#CC0000' }}
                        px={8}
                        minW={40}
                        ml={2}
                      >
                        🚀 Analyze
                      </Button>
                    </Box>
                  </InputGroup>
                </FormControl>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {loading && (
          <Center p={8}>
            <VStack spacing={4}>
              <Spinner size="xl" />
              <Text>Analyzing video comments...</Text>
            </VStack>
          </Center>
        )}

        {error && (
          <Card bg={error.upgradeRequired ? 'orange.50' : 'red.50'}>
            <CardBody>
              <VStack spacing={4}>
                <Text color={error.upgradeRequired ? 'orange.800' : 'red.800'}>
                  {error.error}
                </Text>
                {error.upgradeRequired && userSubscription?.plan !== 'pro' && (
                  <Button
                    colorScheme="orange"
                    onClick={() => router.push('/pricing')}
                  >
                    Upgrade to PRO
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Empty state with showcases */}
        {(!result && !loading && !error) && (
          <Card boxShadow="md" borderRadius="xl" bgGradient="linear(to-br, #fff, #f9f9f9)" p={6} mt={4} w="full" maxW="3xl" alignSelf="center">
            <CardBody>
              <VStack spacing={6} align="center">
                <Heading size="md" color="#FF0000">See What You Can Do!</Heading>
                <Text color="gray.700" fontSize="lg" textAlign="center">
                  Try analyzing a YouTube video to get insights like:
                </Text>
                <VStack spacing={4} align="stretch" w="100%">
                  <Box p={4} bg="#FFF3F3" borderRadius="md" boxShadow="sm">
                    <Text fontWeight="bold" color="#FF0000">🎯 Sentiment Analysis</Text>
                    <Text color="gray.700">See the overall mood of your audience and how they react to your content.</Text>
                  </Box>
                  <Box p={4} bg="#F3F7FF" borderRadius="md" boxShadow="sm">
                    <Text fontWeight="bold" color="#1E88E5">📊 Engagement Metrics</Text>
                    <Text color="gray.700">Discover which comments drive the most engagement and what topics spark discussion.</Text>
                  </Box>
                  <Box p={4} bg="#FFF9E3" borderRadius="md" boxShadow="sm">
                    <Text fontWeight="bold" color="#FFB300">💡 AI-Powered Recommendations</Text>
                    <Text color="gray.700">Get actionable tips to improve your content and grow your channel.</Text>
                  </Box>
                </VStack>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Paste a YouTube video URL above and click <b>Analyze</b> to get started!
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {result && !loading && (
          <AnalysisResult
            comments={result.comments || []}
            statistics={result.statistics || { total_comments: 0, total_likes: 0, average_likes: 0 }}
            visualizations={result.visualizations || {}}
            ai_analysis={result.ai_analysis || {
              sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
              comment_categories: { questions: 0, praise: 0, suggestions: 0, complaints: 0, general: 0 },
              engagement_metrics: { high_engagement: 0, medium_engagement: 0, low_engagement: 0 },
              key_topics: [],
              overall_analysis: { sentiment: 'Not available', engagement_level: 'Not available', community_health: 'Not available' },
              recommendations: [],
            }}
            analysisId={result.id || analysisId}
          />
        )}
      </VStack>
    </DashboardLayout>
  )
}