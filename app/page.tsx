'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  FaYoutube,
  FaChartBar,
  FaComments,
  FaRobot,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa'
import PricingCard from '@/components/PricingCard'

const MotionBox = motion(Box)
const MotionText = motion(Text)

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const features = [
    {
      icon: FaChartBar,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your YouTube comments with powerful analytics tools.',
    },
    {
      icon: FaComments,
      title: 'Sentiment Analysis',
      description: 'Understand the emotional tone of your comments using AI-powered sentiment analysis.',
    },
    {
      icon: FaRobot,
      title: 'AI-Powered Insights',
      description: 'Leverage cutting-edge AI to extract meaningful patterns and trends.',
    },
  ]

  return (
    
    <Box>
      {/* Hero Section */}
      <Box bg={bgColor} minH="10vh" position="relative" overflow="hidden">
        <Container maxW="container.xl" py={20}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heading
                as="h1"
                size="2xl"
                mb={6}
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
              >
                Understand Your YouTube Audience Better
              </Heading>
              <MotionText
                fontSize="xl"
                mb={8}
                color="gray.600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Analyze comments, track sentiment, and gain valuable insights using AI-powered analytics.
              </MotionText>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <Button
                  size="lg"
                  colorScheme="blue"
                  rightIcon={<FaArrowRight />}
                  onClick={() => router.push('/signin')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<FaYoutube />}
                  onClick={() => window.open('https://www.youtube.com', '_blank')}
                >
                  Watch Demo
                </Button>
              </Stack>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image
                src="/hero-image.jpg"
                alt="Analytics Dashboard"
                rounded="lg"
                shadow="2xl"
              />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading mb={4}>Powerful Features</Heading>
              <Text fontSize="xl" color="gray.600">
                Everything you need to understand your YouTube audience
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  p={8}
                  bg={useColorModeValue('white', 'gray.800')}
                  rounded="xl"
                  shadow="lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Icon as={feature.icon} w={10} h={10} color="blue.400" mb={4} />
                  <Heading size="md" mb={4}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box bg={bgColor} py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Heading mb={6}>Why Choose Our Platform?</Heading>
              <List spacing={5}>
                {[
                  'Real-time comment analysis',
                  'Advanced sentiment tracking',
                  'Customizable dashboards',
                  'AI-powered recommendations',
                  'Comprehensive analytics',
                ].map((benefit, index) => (
                  <ListItem key={index} display="flex" alignItems="center">
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="lg">{benefit}</Text>
                  </ListItem>
                ))}
              </List>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Image
                src="/benefits-image.jpg"
                alt="Platform Benefits"
                rounded="lg"
                shadow="xl"
              />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading mb={4}>Simple, Transparent Pricing</Heading>
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
                buttonText="Get Started"
                isPopular={false}
                plan="free"
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
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={bgColor} py={10}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start">
              <Heading size="md" mb={4}>
                YT Analyzer
              </Heading>
              <Text color="gray.600">
                Making YouTube analytics simple and insightful.
              </Text>
            </VStack>
            <VStack align="start">
              <Heading size="sm" mb={4}>
                Product
              </Heading>
              <Text color="gray.600">Features</Text>
              <Text color="gray.600">Pricing</Text>
              <Text color="gray.600">Documentation</Text>
            </VStack>
            <VStack align="start">
              <Heading size="sm" mb={4}>
                Company
              </Heading>
              <Text color="gray.600">About</Text>
              <Text color="gray.600">Blog</Text>
              <Text color="gray.600">Careers</Text>
            </VStack>
            <VStack align="start">
              <Heading size="sm" mb={4}>
                Legal
              </Heading>
              <Text color="gray.600">Privacy</Text>
              <Text color="gray.600">Terms</Text>
              <Text color="gray.600">Security</Text>
            </VStack>
          </SimpleGrid>
          <Box mt={10} pt={10} borderTopWidth={1}>
            <Text textAlign="center" color="gray.600">
              © 2024 YT Analyzer. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
} 