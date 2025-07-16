'use client'

import React, { useEffect, useState } from 'react'
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
  Flex,
  Badge,
  HStack,
  Avatar,
  Divider,
  Link,
  AvatarGroup,
  Progress,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import {
  FaYoutube,
  FaChartBar,
  FaComments,
  FaRobot,
  FaCheckCircle,
  FaArrowRight,
  FaPlay,
  FaStar,
  FaUsers,
  FaTrademark,
  FaShieldAlt,
  FaRocket,
  FaGlobe,
  FaHeart,
  FaQuoteLeft,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaDiscord,
  
  FaChartLine,
  FaThumbsUp,
  FaComment,
  FaEye,
  FaBolt,
  FaCrown,
  FaFire,
  FaTrophy,
  FaLightbulb,
  FaCloud,
  FaInfinity
} from 'react-icons/fa'
import PricingCard from '@/components/PricingCard'
import Navbar from '@/components/Navbar'

export default function Home() {
  const router = useRouter()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({ comments: 0, accuracy: 0, users: 0 });

  const features = [
    {
      icon: FaChartBar,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your YouTube comments with powerful analytics tools.',
      gradient: 'linear(to-br, blue.400, purple.600)',
      
    },
    {
      icon: FaComments,
      title: 'Sentiment Analysis',
      description: 'Understand the emotional tone of your comments using AI-powered sentiment analysis.',
      gradient: 'linear(to-br, green.400, teal.600)',
    },
    {
      icon: FaRobot,
      title: 'AI-Powered Insights',
      description: 'Leverage cutting-edge AI to extract meaningful patterns and trends.',
      gradient: 'linear(to-br, orange.400, red.600)',
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      avatar: "/avatar1.jpg",
      content: "This platform transformed how I understand my audience. The sentiment analysis is incredibly accurate!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "YouTube Channel Manager",
      avatar: "/avatar2.jpg", 
      content: "The insights we get are game-changing. Our engagement has increased by 300% since we started using this.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Digital Marketing Specialist",
      avatar: "/avatar3.jpg",
      content: "Best investment we made for our YouTube strategy. The real-time analytics are phenomenal.",
      rating: 5,
    },
  ]

  const stats = [
    { number: '50K+', label: 'Active Users', icon: FaUsers },
    { number: '10M+', label: 'Comments Analyzed', icon: FaComments },
    { number: '95%', label: 'Accuracy Rate', icon: FaShieldAlt },
    { number: '24/7', label: 'Uptime', icon: FaRocket },
  ]



  const testimonialsHero = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e00db8?w=100&h=100&fit=crop&crop=face",
      text: "This tool completely transformed how I understand my audience. The insights are incredible!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "YouTuber",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      text: "I've tried many analytics tools, but this AI-powered sentiment analysis is game-changing.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Digital Marketer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "The real-time monitoring helped me identify trending topics before my competitors.",
      rating: 5
    }
  ];

  const featuresHero = [
    { icon: FaBolt, text: "Real-time Analysis", color: "yellow.400" },
    { icon: FaShieldAlt, text: "Privacy Protected", color: "green.400" },
    { icon: FaRocket, text: "Lightning Fast", color: "blue.400" },
    { icon: FaInfinity, text: "Unlimited Insights", color: "purple.400" }
  ];

  const partners = [
    { name: "YouTube", logo: FaYoutube, color: "red.500" },
    { name: "Google", logo: FaGlobe, color: "blue.500" },
    { name: "Analytics", logo: FaChartLine, color: "green.500" },
    { name: "AI Cloud", logo: FaCloud, color: "purple.500" }
  ];

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    // Animate stats on mount
    const statsInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        comments: Math.min(prev.comments + 100000, 10000000),
        accuracy: Math.min(prev.accuracy + 1, 95),
        users: Math.min(prev.users + 500, 50000)
      }));
    }, 50);

    setTimeout(() => clearInterval(statsInterval), 3000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <Box>
      <Navbar />
      
      {/* Modern Hero Section - UNCHANGED */}
    <Box 
      position="relative" 
      minH="100vh" 
      overflow="hidden"
      bg="black"
      pt={20}
    >
      {/* Enhanced Animated Background Elements */}
      <Box
        position="absolute"
        top="5%"
        left="5%"
        w="300px"
        h="300px"
        bg="black"
        borderRadius="full"
        sx={{
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(5deg)' },
          },
          animation: 'float 8s ease-in-out infinite',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150px',
            height: '150px',
            bg: 'black',
            borderRadius: 'full',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
              '50%': { transform: 'scale(1.1)', opacity: 1 },
            },
            animation: 'pulse 3s ease-in-out infinite'
          }
        }}
      />
      
      <Box
        position="absolute"
        top="15%"
        right="8%"
        w="200px"
        h="200px"
        bg="black"
        borderRadius="3xl"
        transform="rotate(45deg)"
        sx={{
          '@keyframes floatReverse': {
            '0%, 100%': { transform: 'rotate(45deg) translateY(0px)' },
            '50%': { transform: 'rotate(45deg) translateY(-20px)' },
          },
          animation: 'floatReverse 6s ease-in-out infinite'
        }}
      />
      
      <Box
        position="absolute"
        bottom="10%"
        left="20%"
        w="150px"
        h="150px"
        bg="whiteAlpha.120"
        borderRadius="2xl"
        sx={{
          '@keyframes floatSlow': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-15px)' },
          },
          animation: 'floatSlow 10s ease-in-out infinite'
        }}
      />
      
      <Box
        position="absolute"
        top="40%"
        right="25%"
        w="100px"
        h="100px"
        bg="whiteAlpha.100"
        borderRadius="full"
        sx={{
          '@keyframes pulseSlow': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
            '50%': { transform: 'scale(1.2)', opacity: 1 },
          },
          animation: 'pulseSlow 4s ease-in-out infinite'
        }}
      />

      {/* Multiple Gradient Overlays for Depth */}
      <Box
        position="absolute"
        inset="0"
        bg="black"
        backdropFilter="blur(10px)"
      />
      
      <Box
        position="absolute"
        inset="0"
        bg="radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)"
      />
      
      <Container maxW="container.xl" py={20} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
          <Box color="white">
            {/* Enhanced Social Proof Section */}
            <VStack spacing={4} mb={8} align="start">
              <HStack spacing={4} flexWrap="wrap">
                <Badge 
                  colorScheme="whiteAlpha" 
                  variant="solid" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <HStack spacing={2}>
                    <Icon as={FaStar} color="yellow.300" />
                    <Text fontSize="sm" fontWeight="bold">Trusted by 50K+ creators</Text>
                  </HStack>
                </Badge>
                <Badge 
                  colorScheme="green" 
                  variant="solid" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  bg="green.400"
                >
                  <HStack spacing={1}>
                    <Icon as={FaFire} boxSize={3} />
                    <Text fontSize="xs">Trending #1</Text>
                  </HStack>
                </Badge>
                <Badge 
                  colorScheme="purple" 
                  variant="solid" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  bg="purple.400"
                >
                  <HStack spacing={1}>
                    <Icon as={FaTrophy} boxSize={3} />
                    <Text fontSize="xs">Award Winner</Text>
                  </HStack>
                </Badge>
              </HStack>
              
              {/* User Avatars */}
              <HStack spacing={4}>
                <AvatarGroup size="md" max={4}>
                  <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
                  <Avatar src="https://images.unsplash.com/photo-1494790108755-2616b9e00db8?w=100&h=100&fit=crop&crop=face" />
                  <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                  <Avatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" />
                  <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" />
                </AvatarGroup>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="bold">Join thousands of creators</Text>
                  <HStack spacing={1}>
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} as={FaStar} color="yellow.300" boxSize={3} />
                    ))}
                    <Text fontSize="xs" color="whiteAlpha.800">4.9/5 rating</Text>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
            
            <Heading
              as="h1"
              size="4xl"
              mb={6}
              fontWeight="900"
              lineHeight="1.1"
              bgGradient="linear(to-r, white, gray.200)"
              bgClip="text"
              textShadow="0 0 30px rgba(255,255,255,0.5)"
              sx={{
                '@keyframes slideIn': {
                  from: { transform: 'translateX(-100px)', opacity: 0 },
                  to: { transform: 'translateX(0)', opacity: 1 },
                },
                animation: 'slideIn 1s ease-out'
              }}
            >
              Transform Your YouTube
              <Text as="span" display="block" color="yellow.300">
                Comments Into Gold
              </Text>
              <Text as="span" display="block" fontSize="2xl" color="whiteAlpha.800" fontWeight="400">
                with AI-Powered Insights
              </Text>
            </Heading>
            
            <Text 
              fontSize="xl" 
              mb={6} 
              color="whiteAlpha.900"
              fontWeight="400"
              lineHeight="1.7"
              maxW="600px"
            >
              Unlock the power of AI-driven sentiment analysis and discover what your audience really thinks. 
              Turn every comment into actionable insights that drive growth, engagement, and revenue.
            </Text>
            
            {/* Feature Pills */}
            <HStack spacing={3} mb={8} flexWrap="wrap">
              {featuresHero.map((feature, index) => (
                <HStack 
                  key={index}
                  spacing={2} 
                  px={4} 
                  py={2} 
                  bg="whiteAlpha.200" 
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <Icon as={feature.icon} color={feature.color} boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium">{feature.text}</Text>
                </HStack>
              ))}
            </HStack>
            
            {/* Animated Stats Row */}
            <SimpleGrid columns={3} spacing={8} mb={8}>
              <VStack spacing={1} align="start">
                <Text fontSize="3xl" fontWeight="bold" color="yellow.300">
                  {(animatedStats.comments / 1000000).toFixed(1)}M+
                </Text>
                <Text fontSize="sm" color="whiteAlpha.700">Comments Analyzed</Text>
                <Progress value={100} colorScheme="yellow" size="sm" w="80px" borderRadius="full" />
              </VStack>
              <VStack spacing={1} align="start">
                <Text fontSize="3xl" fontWeight="bold" color="green.300">
                  {animatedStats.accuracy}%
                </Text>
                <Text fontSize="sm" color="whiteAlpha.700">Accuracy Rate</Text>
                <Progress value={animatedStats.accuracy} colorScheme="green" size="sm" w="80px" borderRadius="full" />
              </VStack>
              <VStack spacing={1} align="start">
                <Text fontSize="3xl" fontWeight="bold" color="blue.300">
                  {(animatedStats.users / 1000).toFixed(0)}K+
                </Text>
                <Text fontSize="sm" color="whiteAlpha.700">Active Users</Text>
                <Progress value={100} colorScheme="blue" size="sm" w="80px" borderRadius="full" />
              </VStack>
            </SimpleGrid>
            
            {/* Call to Action Buttons */}
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mb={8}>
              <Button
                size="lg"
                bg="white"
                color="purple.600"
                rightIcon={<FaArrowRight />}
                onClick={() => router.push('/signin')}
                borderRadius="full"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
                boxShadow="0 10px 30px rgba(255,255,255,0.3)"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 40px rgba(255,255,255,0.4)',
                  bg: 'gray.50'
                }}
                transition="all 0.3s ease"
              >
                Start Free Analysis
              </Button>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<FaPlay />}
                borderColor="whiteAlpha.500"
                color="white"
                borderRadius="full"
                px={8}
                py={6}
                fontSize="lg"
                backdropFilter="blur(10px)"
                bg="whiteAlpha.200"
                _hover={{
                  bg: 'whiteAlpha.300',
                  borderColor: 'whiteAlpha.700',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.3s ease"
              >
                Watch Demo
              </Button>
            </Stack>
            
            {/* Partner Logos */}
            <VStack spacing={3} align="start">
              <Text fontSize="sm" color="whiteAlpha.700">Trusted by industry leaders:</Text>
              <HStack spacing={6}>
                {partners.map((partner, index) => (
                  <HStack key={index} spacing={2} opacity={0.8}>
                    <Icon as={partner.logo} color={partner.color} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">{partner.name}</Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>
          </Box>
          
          {/* Enhanced Dashboard Preview */}
          <Box position="relative">
            {/* Main Dashboard */}
            <Box
              bg="whiteAlpha.100"
              borderRadius="3xl"
              p={1}
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              boxShadow="0 25px 50px rgba(0,0,0,0.2)"
              transform="rotate(-2deg)"
              _hover={{ transform: 'rotate(0deg)' }}
              transition="all 0.5s ease"
            >
              <Box
                bg="white"
                borderRadius="2xl"
                p={6}
                minH="500px"
                position="relative"
                overflow="hidden"
              >
                {/* Dashboard Header */}
                <HStack justify="space-between" mb={6}>
                  <HStack>
                    <Box w={3} h={3} bg="red.400" borderRadius="full" />
                    <Box w={3} h={3} bg="yellow.400" borderRadius="full" />
                    <Box w={3} h={3} bg="green.400" borderRadius="full" />
                  </HStack>
                  <HStack spacing={2}>
                    <Badge colorScheme="green" variant="solid" borderRadius="full">
                      <HStack spacing={1}>
                        <Box w={2} h={2} bg="green.300" borderRadius="full" />
                        <Text fontSize="xs">Live</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="blue" variant="outline" borderRadius="full">
                      <HStack spacing={1}>
                        <Icon as={FaEye} boxSize={3} />
                        <Text fontSize="xs">Real-time</Text>
                      </HStack>
                    </Badge>
                  </HStack>
                </HStack>
                
                {/* Enhanced Dashboard Content */}
                <VStack spacing={6} align="stretch">
                  {/* Sentiment Analysis */}
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        Sentiment Analysis
                      </Text>
                      <Badge colorScheme="purple" variant="subtle">
                        <HStack spacing={1}>
                          <Icon as={FaLightbulb} boxSize={3} />
                          <Text fontSize="xs">AI Powered</Text>
                        </HStack>
                      </Badge>
                    </HStack>
                    <VStack spacing={2} align="stretch">
                      <HStack>
                        <Box flex={3} h={6} bg="green.200" borderRadius="full" position="relative">
                          <Box 
                            position="absolute" 
                            right={2} 
                            top="50%" 
                            transform="translateY(-50%)"
                            fontSize="xs" 
                            fontWeight="bold" 
                            color="green.800"
                          >
                            72%
                          </Box>
                        </Box>
                        <Text fontSize="sm" color="gray.600" w="20">Positive</Text>
                      </HStack>
                      <HStack>
                        <Box flex={1} h={6} bg="yellow.200" borderRadius="full" position="relative">
                          <Box 
                            position="absolute" 
                            right={2} 
                            top="50%" 
                            transform="translateY(-50%)"
                            fontSize="xs" 
                            fontWeight="bold" 
                            color="yellow.800"
                          >
                            20%
                          </Box>
                        </Box>
                        <Text fontSize="sm" color="gray.600" w="20">Neutral</Text>
                      </HStack>
                      <HStack>
                        <Box flex={0.3} h={6} bg="red.200" borderRadius="full" position="relative">
                          <Box 
                            position="absolute" 
                            right={2} 
                            top="50%" 
                            transform="translateY(-50%)"
                            fontSize="xs" 
                            fontWeight="bold" 
                            color="red.800"
                          >
                            8%
                          </Box>
                        </Box>
                        <Text fontSize="sm" color="gray.600" w="20">Negative</Text>
                      </HStack>
                    </VStack>
                  </Box>
                  
                  {/* Enhanced Stats Grid */}
                  <SimpleGrid columns={2} spacing={4}>
                    <Box p={4} bg="gradient-to-br from-blue.50 to-blue.100" borderRadius="xl" border="1px solid" borderColor="blue.200">
                      <HStack justify="space-between" mb={2}>
                        <Icon as={FaThumbsUp} color="blue.600" boxSize={5} />
                        <Badge colorScheme="blue" variant="subtle" fontSize="2xs">+12%</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        87%
                      </Text>
                      <Text fontSize="sm" color="gray.600">Positive Rate</Text>
                    </Box>
                    <Box p={4} bg="gradient-to-br from-purple.50 to-purple.100" borderRadius="xl" border="1px solid" borderColor="purple.200">
                      <HStack justify="space-between" mb={2}>
                        <Icon as={FaComment} color="purple.600" boxSize={5} />
                        <Badge colorScheme="purple" variant="subtle" fontSize="2xs">+5.2K</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        1.2K
                      </Text>
                      <Text fontSize="sm" color="gray.600">Comments</Text>
                    </Box>
                    <Box p={4} bg="gradient-to-br from-green.50 to-green.100" borderRadius="xl" border="1px solid" borderColor="green.200">
                      <HStack justify="space-between" mb={2}>
                        <Icon as={FaHeart} color="green.600" boxSize={5} />
                        <Badge colorScheme="green" variant="subtle" fontSize="2xs">+8%</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        94%
                      </Text>
                      <Text fontSize="sm" color="gray.600">Engagement</Text>
                    </Box>
                    <Box p={4} bg="gradient-to-br from-orange.50 to-orange.100" borderRadius="xl" border="1px solid" borderColor="orange.200">
                      <HStack justify="space-between" mb={2}>
                        <Icon as={FaRocket} color="orange.600" boxSize={5} />
                        <Badge colorScheme="orange" variant="subtle" fontSize="2xs">+15%</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        2.1M
                      </Text>
                      <Text fontSize="sm" color="gray.600">Reach</Text>
                    </Box>
                  </SimpleGrid>
                  
                  {/* Top Keywords with Enhanced Design */}
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" color="gray.600">Trending Keywords</Text>
                      <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                        <HStack spacing={1}>
                          <Icon as={FaFire} boxSize={2} />
                          <Text>Hot</Text>
                        </HStack>
                      </Badge>
                    </HStack>
                    <Flex flexWrap="wrap" gap={2}>
                      {[
                        { word: 'amazing', intensity: 'high' },
                        { word: 'love it', intensity: 'high' },
                        { word: 'helpful', intensity: 'medium' },
                        { word: 'great content', intensity: 'high' },
                        { word: 'awesome', intensity: 'medium' },
                        { word: 'inspiring', intensity: 'low' }
                      ].map((keyword, index) => (
                        <Badge 
                          key={index} 
                          colorScheme={keyword.intensity === 'high' ? 'blue' : keyword.intensity === 'medium' ? 'purple' : 'gray'} 
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {keyword.word}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </VStack>
                
                {/* Enhanced Floating Elements */}
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  w={10}
                  h={10}
                  bg="purple.400"
                  borderRadius="full"
                  opacity={0.6}
                  sx={{
                    '@keyframes pulseGlow': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                      '50%': { transform: 'scale(1.2)', opacity: 1 },
                    },
                    animation: 'pulseGlow 3s infinite'
                  }}
                />
                <Box
                  position="absolute"
                  bottom={4}
                  left={4}
                  w={6}
                  h={6}
                  bg="blue.400"
                  borderRadius="full"
                  opacity={0.4}
                  sx={{
                    '@keyframes pulseFast': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.4 },
                      '50%': { transform: 'scale(1.3)', opacity: 0.8 },
                    },
                    animation: 'pulseFast 2s infinite'
                  }}
                />
              </Box>
            </Box>
            
            {/* Enhanced Floating Cards */}
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              bg="white"
              p={4}
              borderRadius="2xl"
              boxShadow="0 20px 40px rgba(0,0,0,0.1)"
              border="1px solid"
              borderColor="gray.100"
              minW="200px"
              sx={{
                '@keyframes floatCard1': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
                animation: 'floatCard1 6s ease-in-out infinite'
              }}
            >
              <VStack spacing={3}>
                <HStack spacing={3} w="full">
                  <Icon as={FaUsers} color="blue.500" boxSize={6} />
                  <VStack spacing={0} align="start" flex={1}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      +2,847
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      New insights today
                    </Text>
                  </VStack>
                </HStack>
                <Progress value={75} colorScheme="blue" size="sm" w="full" borderRadius="full" />
              </VStack>
            </Box>
            
            <Box
              position="absolute"
              bottom="-40px"
              left="-40px"
              bg="white"
              p={4}
              borderRadius="2xl"
              boxShadow="0 20px 40px rgba(0,0,0,0.1)"
              border="1px solid"
              borderColor="gray.100"
              minW="180px"
              sx={{
                '@keyframes floatCard2': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-15px)' },
                },
                animation: 'floatCard2 8s ease-in-out infinite'
              }}
            >
              <VStack spacing={2}>
                <HStack spacing={2} w="full">
                  <Icon as={FaChartLine} color="green.500" boxSize={5} />
                  <VStack spacing={0} align="start" flex={1}>
                    <Text fontSize="md" fontWeight="bold" color="gray.800">
                      98.5%
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Uptime
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme="green" variant="subtle" w="full" textAlign="center">
                  <HStack spacing={1} justify="center">
                    <Icon as={FaCheckCircle} boxSize={3} />
                    <Text fontSize="2xs">All systems operational</Text>
                  </HStack>
                </Badge>
              </VStack>
            </Box>
            
            {/* Testimonial Card */}
            <Box
              position="absolute"
              top="50%"
              left="-60px"
              transform="translateY(-50%)"
              bg="white"
              p={4}
              borderRadius="2xl"
              boxShadow="0 20px 40px rgba(0,0,0,0.1)"
              border="1px solid"
              borderColor="gray.100"
              maxW="250px"
              sx={{
                '@keyframes floatCard3': {
                  '0%, 100%': { transform: 'translateY(-50%) translateX(0px)' },
                  '50%': { transform: 'translateY(-50%) translateX(-10px)' },
                },
                animation: 'floatCard3 10s ease-in-out infinite'
              }}
            >
              <VStack spacing={3}>
                <HStack spacing={3} w="full">
                  <Avatar 
                    src={testimonialsHero[currentTestimonial].avatar} 
                    size="sm"
                  />
                  <VStack spacing={0} align="start" flex={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">
                      {testimonialsHero[currentTestimonial].name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {testimonialsHero[currentTestimonial].role}
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize="xs" color="gray.600" textAlign="left">
                  <Icon as={FaQuoteLeft} boxSize={3} color="gray.400" mr={1} />
                  {testimonialsHero[currentTestimonial].text}
                </Text>
                <HStack spacing={1} w="full">
                  {[...Array(testimonialsHero[currentTestimonial].rating)].map((_, i) => (
                    <Icon key={i} as={FaStar} color="yellow.400" boxSize={3} />
                  ))}
                </HStack>
              </VStack>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>

      {/* Modern Stats Section */}
      <Box py={20} bg="white" position="relative" overflow="hidden">
        <Container maxW="container.xl">
          <VStack spacing={16} textAlign="center">
            <Box>
              <Badge 
                colorScheme="purple" 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                mb={4}
                fontSize="sm"
                fontWeight="semibold"
              >
                ⚡ Trusted by thousands
              </Badge>
              <Heading size="2xl" mb={4} fontWeight="800">
                Numbers That Speak
                <Text as="span" color="purple.500"> Volumes</Text>
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Join the revolution of data-driven content creators who are transforming their YouTube strategy
              </Text>
            </Box>
            
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
              {stats.map((stat, index) => (
                <Box
                  key={index}
                  p={8}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="0 10px 40px rgba(0,0,0,0.1)"
                  border="1px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  }}
                  transition="all 0.3s ease"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="full"
                    h="2px"
                    bgGradient="linear(to-r, purple.400, blue.400)"
                  />
                  <VStack spacing={4}>
                    <Box
                      p={3}
                      bg="purple.50"
                      borderRadius="xl"
                      color="purple.500"
                    >
                      <Icon as={stat.icon} boxSize={8} />
                    </Box>
                    <VStack spacing={1}>
                      <Text fontSize="4xl" fontWeight="900" color="gray.800">
                        {stat.number}
                      </Text>
                      <Text fontSize="lg" color="gray.600" fontWeight="medium">
                        {stat.label}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Modern Features Section */}
      <Box py={20} bg="gray.50" position="relative" overflow="hidden">
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          opacity={0.1}
          backgroundImage="radial-gradient(circle at 1px 1px, purple.400 1px, transparent 0)"
          backgroundSize="40px 40px"
        />
        
        <Container maxW="container.xl" position="relative">
          <VStack spacing={16} textAlign="center">
            <Box>
              <Badge 
                colorScheme="blue" 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                mb={4}
                fontSize="sm"
                fontWeight="semibold"
              >
                🚀 Power Features
              </Badge>
              <Heading size="2xl" mb={4} fontWeight="800">
                Everything You Need to
                <Text as="span" color="blue.500"> Dominate YouTube</Text>
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Our AI-powered platform gives you superpowers to understand and engage with your audience like never before
              </Text>
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {features.map((feature, index) => (
                <Box
                  key={index}
                  p={8}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="0 10px 40px rgba(0,0,0,0.1)"
                  border="1px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-10px)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                  }}
                  transition="all 0.4s ease"
                >
                  {/* Gradient Background */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="full"
                    h="4px"
                    bgGradient={feature.gradient}
                  />
                  
                  {/* Icon with Gradient Background */}
                  <Box
                    w={16}
                    h={16}
                    borderRadius="2xl"
                    bgGradient={feature.gradient}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={6}
                    position="relative"
                  >
                    <Icon as={feature.icon} boxSize={8} color="white" />
                  </Box>
                  
                  <VStack spacing={4} align="start">
                    <Heading size="lg" fontWeight="700">
                      {feature.title}
                    </Heading>
                    <Text color="gray.600" fontSize="lg" lineHeight="1.6">
                      {feature.description}
                    </Text>
                    
                    {/* Hover Arrow */}
                    <HStack 
                      spacing={2} 
                      color="purple.500" 
                      fontWeight="semibold"
                      opacity={0}
                      transform="translateX(-10px)"
                      transition="all 0.3s ease"
                      _groupHover={{
                        opacity: 1,
                        transform: 'translateX(0)',
                      }}
                    >
                      <Text>Learn more</Text>
                      <Icon as={FaArrowRight} />
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Modern Benefits Section */}
      <Box py={20} bg="white" position="relative" overflow="hidden">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <Box>
              <Badge 
                colorScheme="green" 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                mb={4}
                fontSize="sm"
                fontWeight="semibold"
              >
                ✨ Why Choose Us
              </Badge>
              <Heading size="2xl" mb={6} fontWeight="800">
                Transform Your YouTube
                <Text as="span" color="green.500"> Strategy Today</Text>
              </Heading>
              <Text fontSize="xl" color="gray.600" mb={8} lineHeight="1.6">
                Don't just post content - understand your audience deeply and create content that truly resonates
              </Text>
              
              <VStack spacing={6} align="stretch">
                {[
                  { 
                    text: 'Real-time comment analysis with instant insights',
                    icon: FaRocket,
                    color: 'blue.500'
                  },
                  { 
                    text: 'Advanced sentiment tracking across all your videos',
                    icon: FaChartBar,
                    color: 'purple.500'
                  },
                  { 
                    text: 'Customizable dashboards tailored to your needs',
                    icon: FaGlobe,
                    color: 'green.500'
                  },
                  { 
                    text: 'AI-powered recommendations for better engagement',
                    icon: FaRobot,
                    color: 'orange.500'
                  },
                  { 
                    text: 'Comprehensive analytics with exportable reports',
                    icon: FaShieldAlt,
                    color: 'red.500'
                  },
                ].map((benefit, index) => (
                  <HStack
                    key={index}
                    spacing={4}
                    p={4}
                    borderRadius="xl"
                    _hover={{
                      bg: 'gray.50',
                      transform: 'translateX(10px)',
                    }}
                    transition="all 0.3s ease"
                  >
                    <Box
                      p={3}
                      bg={`${benefit.color.split('.')[0]}.50`}
                      borderRadius="lg"
                      color={benefit.color}
                    >
                      <Icon as={benefit.icon} boxSize={5} />
                    </Box>
                    <Text fontSize="lg" fontWeight="medium" color="gray.800">
                      {benefit.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
            
            <Box position="relative">
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 25px 50px rgba(0,0,0,0.15)"
                transform="rotate(2deg)"
                _hover={{ transform: 'rotate(0deg)' }}
                transition="all 0.5s ease"
              >
                <Box
                  bg="gradient-to-br from-purple-500 to-blue-600"
                  p={1}
                  borderRadius="2xl"
                >
                  <Box
                    bg="white"
                    borderRadius="xl"
                    p={6}
                    minH="400px"
                  >
                    <VStack spacing={6}>
                      <HStack justify="space-between" w="full">
                        <Badge colorScheme="purple" variant="solid">
                          Live Analytics
                        </Badge>
                        <Badge colorScheme="green" variant="solid">
                          98% Uptime
                        </Badge>
                      </HStack>
                      
                      <Box w="full">
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                          Comment Sentiment Trends
                        </Text>
                        <Box h="200px" bg="gray.50" borderRadius="lg" position="relative">
                          <Box
                            position="absolute"
                            bottom={4}
                            left={4}
                            right={4}
                            h="2px"
                            bg="purple.200"
                            borderRadius="full"
                          />
                          <Box
                            position="absolute"
                            bottom={4}
                            left={4}
                            w="70%"
                            h="2px"
                            bg="purple.500"
                            borderRadius="full"
                          />
                        </Box>
                      </Box>
                      
                      <SimpleGrid columns={2} spacing={4} w="full">
                        <Box textAlign="center">
                          <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            +127%
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Positive Comments
                          </Text>
                        </Box>
                        <Box textAlign="center">
                          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                            4.8/5
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Avg. Rating
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                </Box>
              </Box>
              
              {/* Floating Elements */}
              <Box
                position="absolute"
                top="-10px"
                right="-10px"
                bg="white"
                p={4}
                borderRadius="xl"
                boxShadow="0 10px 30px rgba(0,0,0,0.1)"
                animation="float 3s ease-in-out infinite"
              >
                <HStack spacing={2}>
                  <Icon as={FaHeart} color="red.500" />
                  <Text fontSize="sm" fontWeight="bold">
                    1.2K Loves
                  </Text>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Modern Testimonials Section */}
      <Box py={20} bg="gray.50" position="relative" overflow="hidden">
        <Container maxW="container.xl">
          <VStack spacing={16} textAlign="center">
            <Box>
              <Badge 
                colorScheme="yellow" 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                mb={4}
                fontSize="sm"
                fontWeight="semibold"
              >
                💬 What Our Users Say
              </Badge>
              <Heading size="2xl" mb={4} fontWeight="800">
                Loved by Creators
                <Text as="span" color="yellow.500"> Worldwide</Text>
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Don't just take our word for it - hear from the creators who've transformed their channels
              </Text>
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {testimonials.map((testimonial, index) => (
                <Box
                  key={index}
                  p={8}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="0 10px 40px rgba(0,0,0,0.1)"
                  border="1px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  }}
                  transition="all 0.4s ease"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="full"
                    h="4px"
                    bgGradient="linear(to-r, yellow.400, orange.400)"
                  />
                  
                  <VStack spacing={6} align="start">
                    <Icon as={FaQuoteLeft} boxSize={8} color="yellow.400" />
                    
                    <Text fontSize="lg" color="gray.700" lineHeight="1.6">
                      "{testimonial.content}"
                    </Text>
                    
                    <HStack spacing={1} color="yellow.400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Icon key={i} as={FaStar} boxSize={4} />
                      ))}
                    </HStack>
                    
                    <HStack spacing={4}>
                      <Avatar 
                        src={testimonial.avatar} 
                        size="md"
                        bg="purple.500"
                        color="white"
                        name={testimonial.name}
                      />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="bold" color="gray.800">
                          {testimonial.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {testimonial.role}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>


      {/* Modern Pricing Section */}
      <Box py={20} bg="white" position="relative" overflow="hidden">
        <Container maxW="container.xl">
          <VStack spacing={16} textAlign="center">
            <Box>
              <Badge 
                colorScheme="purple" 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                mb={4}
                fontSize="sm"
                fontWeight="semibold"
              >
                💰 Flexible Plans
              </Badge>
              <Heading size="2xl" mb={4} fontWeight="800">
                Choose Your Perfect
                <Text as="span" color="purple.500"> Plan</Text>
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Start free and upgrade as your channel grows with our seamless scaling options
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {/* Free Plan */}
              <Box
                p={8}
                bg="white"
                borderRadius="2xl"
                boxShadow="0 10px 40px rgba(0,0,0,0.08)"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                }}
                transition="all 0.4s ease"
              >
                <VStack spacing={6} align="start">
                  <Box>
                    <Text fontWeight="bold" color="purple.500" textTransform="uppercase" letterSpacing="wide" fontSize="sm">
                      Starter
                    </Text>
                    <HStack spacing={1}>
                      <Text fontSize="4xl" fontWeight="900" color="gray.800">
                        Free
                      </Text>
                      <Text fontSize="lg" color="gray.500" pt={1}>
                        forever
                      </Text>
                    </HStack>
                  </Box>
                  <List spacing={3} color="gray.600">
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Up to 500 comments/month</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Basic sentiment analysis</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Standard reports</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start" opacity={0.6}>
                      <ListIcon as={FaCheckCircle} color="gray.300" mt={0.5} />
                      <Text>Priority support</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start" opacity={0.6}>
                      <ListIcon as={FaCheckCircle} color="gray.300" mt={0.5} />
                      <Text>Custom dashboards</Text>
                    </ListItem>
                  </List>
                  <Button
                    onClick={() => router.push('/signup')}
                    colorScheme="purple"
                    variant="outline"
                    borderRadius="full"
                    w="full"
                    mt={4}
                  >
                    Get Started
                  </Button>
                </VStack>
              </Box>

              {/* Pro Plan - Most Popular */}
              <Box
                p={8}
                bg="white"
                borderRadius="2xl"
                boxShadow="0 10px 40px rgba(0,0,0,0.12)"
                border="1px solid"
                borderColor="purple.200"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '"Most Popular"',
                  position: "absolute",
                  top: "-10px",
                  right: "-30px",
                  transform: "rotate(45deg)",
                  bg: "purple.500",
                  color: "white",
                  px: 6,
                  py: 1,
                  fontSize: "sm",
                  fontWeight: "bold",
                  zIndex: 1
                }}
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
                transition="all 0.4s ease"
              >
                <VStack spacing={6} align="start">
                  <Box>
                    <Text fontWeight="bold" color="purple.500" textTransform="uppercase" letterSpacing="wide" fontSize="sm">
                      Pro
                    </Text>
                    <HStack spacing={1}>
                      <Text fontSize="4xl" fontWeight="900" color="gray.800">
                        $10
                      </Text>
                      <Text fontSize="lg" color="gray.500" pt={1}>
                        /month
                      </Text>
                    </HStack>
                  </Box>
                  <List spacing={3} color="gray.600">
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Up to 10,000 comments/month</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Advanced sentiment analysis</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Real-time analytics</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Custom reports</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start" opacity={0.6}>
                      <ListIcon as={FaCheckCircle} color="gray.300" mt={0.5} />
                      <Text>Team collaboration tools</Text>
                    </ListItem>
                  </List>
                  <Button
                    onClick={() => router.push('/pricing')}
                    colorScheme="purple"
                    borderRadius="full"
                    w="full"
                    mt={4}
                  >
                    Choose Pro Plan
                  </Button>
                </VStack>
              </Box>

              {/* Enterprise Plan */}
              <Box
                p={8}
                bg="white"
                borderRadius="2xl"
                boxShadow="0 10px 40px rgba(0,0,0,0.08)"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                }}
                transition="all 0.4s ease"
              >
                <VStack spacing={6} align="start">
                  <Box>
                    <Text fontWeight="bold" color="purple.500" textTransform="uppercase" letterSpacing="wide" fontSize="sm">
                      Enterprise
                    </Text>
                    <HStack spacing={1}>
                      <Text fontSize="4xl" fontWeight="900" color="gray.800">
                        Custom
                      </Text>
                      <Text fontSize="lg" color="gray.500" pt={1}>
                        pricing
                      </Text>
                    </HStack>
                  </Box>
                  <List spacing={3} color="gray.600">
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Unlimited comments</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Premium sentiment analysis</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Dedicated account manager</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Custom integrations</Text>
                    </ListItem>
                    <ListItem display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={0.5} />
                      <Text>Team collaboration tools</Text>
                    </ListItem>
                  </List>
                  <Button
                    onClick={() => router.push('/contact')}
                    colorScheme="purple"
                    variant="outline"
                    borderRadius="full"
                    w="full"
                    mt={4}
                  >
                    Contact Sales
                  </Button>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        py={20} 
        bgGradient="linear(to-r, purple.600, blue.600)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-50%"
          left="50%"
          transform="translateX(-50%)"
          w="800px"
          h="800px"
          bg="whiteAlpha.100"
          borderRadius="full"
          filter="blur(100px)"
          animation="float 8s ease-in-out infinite"
        />
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center" color="white">
            <VStack spacing={4}>
              <Badge 
                colorScheme="whiteAlpha" 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                fontSize="sm"
                fontWeight="semibold"
              >
                Ready to Transform Your YouTube Strategy?
              </Badge>
              <Heading size="2xl" fontWeight="800" lineHeight="1.2" maxW="3xl">
                <Text as="span" display="block">Start Understanding Your Audience</Text>
                <Text as="span" color="yellow.300"> Today With AI-Powered Insights</Text>
              </Heading>
            </VStack>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={4}>
              <Button
                size="lg"
                bg="white"
                color="purple.600"
                rightIcon={<FaArrowRight />}
                onClick={() => router.push('/signin')}
                borderRadius="full"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
                boxShadow="0 10px 30px rgba(255,255,255,0.3)"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 40px rgba(255,255,255,0.4)',
                  bg: 'gray.50'
                }}
                transition="all 0.3s ease"
              >
                Start Free Analysis
              </Button>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<FaPlay />}
                onClick={() => window.open('https://www.youtube.com ', '_blank')}
                borderColor="whiteAlpha.500"
                color="white"
                borderRadius="full"
                px={8}
                py={6}
                fontSize="lg"
                backdropFilter="blur(10px)"
                bg="whiteAlpha.200"
                _hover={{
                  bg: 'whiteAlpha.300',
                  borderColor: 'whiteAlpha.700',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.3s ease"
              >
                Watch Demo
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={bgColor} py={10}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} mb={8}>
            <Box>
              <Heading as="h3" fontSize="lg" fontWeight="bold" mb={4} color="white">
                AnalyzeMyComments
              </Heading>
              <Text fontSize="sm" mb={4}>
                Turning YouTube comments into actionable insights using cutting-edge AI technology.
              </Text>
              <HStack spacing={3}>
                <Link href="#" _hover={{ color: "purple.400" }}>
                  <Icon as={FaTwitter} boxSize={5} />
                </Link>
                <Link href="#" _hover={{ color: "purple.400" }}>
                  <Icon as={FaLinkedin} boxSize={5} />
                </Link>
                <Link href="#" _hover={{ color: "purple.400" }}>
                  <Icon as={FaInstagram} boxSize={5} />
                </Link>
                <Link href="#" _hover={{ color: "purple.400" }}>
                  <Icon as={FaDiscord} boxSize={5} />
                </Link>
              </HStack>
            </Box>
            <Box>
              <Heading as="h3" fontSize="lg" fontWeight="bold" mb={4} color="white">
                Product
              </Heading>
              <VStack align="start" spacing={2}>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Features</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Pricing</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Testimonials</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>FAQ</Link>
              </VStack>
            </Box>
            <Box>
              <Heading as="h3" fontSize="lg" fontWeight="bold" mb={4} color="white">
                Resources
              </Heading>
              <VStack align="start" spacing={2}>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Blog</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Documentation</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>API Reference</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Help Center</Link>
              </VStack>
            </Box>
            <Box>
              <Heading as="h3" fontSize="lg" fontWeight="bold" mb={4} color="white">
                Legal
              </Heading>
              <VStack align="start" spacing={2}>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Privacy Policy</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Terms of Service</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>Cookie Policy</Link>
                <Link href="#" fontSize="sm" _hover={{ color: "purple.400" }}>GDPR Compliance</Link>
              </VStack>
            </Box>
          </SimpleGrid>
          <Divider borderColor="gray.700" mb={8} />
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text fontSize="sm" color="gray.400">
              © 2023 AnalyzeMyComments. All rights reserved.
            </Text>
            <HStack spacing={6}>
              <Link href="#" fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                Privacy Policy
              </Link>
              <Link href="#" fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                Terms of Service
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
      
    </Box>
  )
}