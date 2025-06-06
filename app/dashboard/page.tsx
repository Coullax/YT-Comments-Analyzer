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

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Video URL</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={MdVideoLibrary} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      type="url"
                      name="videoUrl"
                      placeholder="Enter YouTube video URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      isDisabled={loading}
                    />
                  </InputGroup>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  width="full"
                  loadingText="Analyzing comments..."
                >
                  Analyze Comments
                </Button>
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

        {result && !loading && (
          <AnalysisResult
            comments={result.comments}
            statistics={result.statistics}
            visualizations={result.sentiment_visualization}
            ai_analysis={result.gemini_analysis}
            analysisId={analysisId}
          />
        )}
      </VStack>
    </DashboardLayout>
  )
} 