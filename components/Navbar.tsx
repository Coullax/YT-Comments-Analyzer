'use client'

import React from 'react'
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
  Spacer,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
  Link as ChakraLink,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
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
  FaBars,
  FaRocket,
  FaShieldAlt,
  FaLightbulb,
  FaGem,
  FaChevronDown,
  FaGlobe,
  FaCode,
  FaHeart,
} from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import PricingCard from '@/components/PricingCard'

// Modern Navbar Component
export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box 
      as="nav" 
      position="fixed" 
      top="0" 
      left="0" 
      right="0" 
      zIndex="1000"
      bg="transparent"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      transition="all 0.3s ease"
    >
      <Container maxW="container.xl" py={4}>
        <Flex align="center">
          <Link href="/" passHref>
            <HStack cursor="pointer" spacing={2}>
              <Box
                w={8}
                h={8}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaRocket} color="white" boxSize={4} />
              </Box>
              <Heading size="md" bgGradient="linear(to-r, purple.600, blue.600)" bgClip="text">
                Rumbletrack
              </Heading>
            </HStack>
          </Link>
          
          <Spacer />
          
          {/* Desktop Navigation */}
          {/* <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            <ChakraLink 
              href="#features" 
              fontSize="sm" 
              fontWeight="500"
              color="gray.700"
              _hover={{ color: 'purple.600' }}
              transition="color 0.2s"
            >
              Features
            </ChakraLink>
            <ChakraLink 
              href="#pricing" 
              fontSize="sm" 
              fontWeight="500"
              color="gray.700"
              _hover={{ color: 'purple.600' }}
              transition="color 0.2s"
            >
              Pricing
            </ChakraLink>
            <ChakraLink 
              href="#about" 
              fontSize="sm" 
              fontWeight="500"
              color="gray.700"
              _hover={{ color: 'purple.600' }}
              transition="color 0.2s"
            >
              About
            </ChakraLink>
          </HStack> */}
          
          <Spacer />
          
          <HStack spacing={4}>
            {status === 'loading' ? (
              <Box w={8} h={8} bg="gray.200" borderRadius="full" />
            ) : session ? (
              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    src={session.user?.image || undefined}
                    name={session.user?.name || 'User'}
                    border="2px solid"
                    borderColor="purple.200"
                  />
                </MenuButton>
                <MenuList 
                  bg="white" 
                  borderColor="gray.200"
                  boxShadow="xl"
                  borderRadius="xl"
                  py={2}
                >
                  <MenuItem 
                    onClick={() => signOut()}
                    _hover={{ bg: 'red.50', color: 'red.600' }}
                    borderRadius="md"
                    mx={2}
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                size="sm"
                borderRadius="full"
                leftIcon={<FcGoogle />}
                onClick={() => router.push('/signin')}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg'
                }}
                transition="all 0.2s"
                suppressHydrationWarning
              >
                Sign In
              </Button>
            )}
            
            {/* Mobile menu button */}
            <IconButton
              aria-label="Open menu"
              icon={<FaBars />}
              variant="ghost"
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
            />
          </HStack>
        </Flex>
      </Container>
      
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <ChakraLink href="#features" onClick={onClose}>Features</ChakraLink>
              <ChakraLink href="#pricing" onClick={onClose}>Pricing</ChakraLink>
              <ChakraLink href="#about" onClick={onClose}>About</ChakraLink>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}