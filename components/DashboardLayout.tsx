'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  CloseButton,
  VStack,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Button,
  IconButton as ChakraIconButton,
  Badge,
  Tooltip,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiSettings,
  FiMenu,
  FiUser,
  FiBell,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { GrChannel, GrCommand } from "react-icons/gr"
import { motion, AnimatePresence } from 'framer-motion'

interface LinkItemProps {
  name: string
  icon: IconType
  path: string
  badge?: string
  badgeColor?: string
  comingSoon?: boolean
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null)
  const { data: session } = useSession()
  
  const sidebarWidth = useBreakpointValue({ base: 'full', md: '280px' })

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/getUserSubscriptionDetails',{ method: 'GET' })
          const data = await response.json()
          setSubscription(data)
        } catch (error) {
          console.error('Error fetching subscription:', error)
        }
      }
    }
    fetchSubscription()
  }, [session])

  return (
    <Box 
      minH="100vh" 
      bg={useColorModeValue('gray.50', 'gray.900')}
      position="relative"
    >
      {/* Animated background gradient */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={useColorModeValue(
          'radial(circle at 20% 80%, blue.100 0%, transparent 50%), radial(circle at 80% 20%, purple.100 0%, transparent 50%)',
          'radial(circle at 20% 80%, blue.900 0%, transparent 50%), radial(circle at 80% 20%, purple.900 0%, transparent 50%)'
        )}
        opacity={0.3}
        zIndex={-1}
      />
      
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
        subscription={subscription}
      />
      
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} subscription={subscription} />
        </DrawerContent>
      </Drawer>
      
      <MobileNav onOpen={onOpen} subscription={subscription} />
      
      <Box 
        ml={{ base: 0, md: '280px' }} 
        transition="margin-left 0.3s ease"
      >
        <Box p={{ base: 4, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </Box>
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
  subscription: { plan: string } | null
}

const SidebarContent = ({ onClose, subscription, ...rest }: SidebarProps) => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const isPro = subscription?.plan === 'pro'

  const LinkItems: Array<LinkItemProps> = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Analytics', icon: FiTrendingUp, path: '/analytics-results', badge: 'New', badgeColor: 'green' },
    { name: 'Channel', icon: GrChannel, path: '/channel' },
    { name: 'Compare', icon: GrCommand, path: '/compare-videos' },
    { name: 'Upgrade', icon: FiCompass, path: '/pricing', badge: isPro ? 'Pro' : 'Free', badgeColor: isPro ? 'purple' : 'gray' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ]


  return (
    <Box
      transition="all 0.3s ease"
      bg={useColorModeValue(
        'rgba(255, 255, 255, 0.95)',
        'rgba(26, 32, 44, 0.95)'
      )}
      backdropFilter="blur(20px)"
      borderRight="1px solid"
      borderRightColor={useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)')}
      w={{ base: 'full', md: '280px' }}
      pos="fixed"
      h="full"
      boxShadow={useColorModeValue(
        '0 4px 20px rgba(0, 0, 0, 0.08)',
        '0 4px 20px rgba(0, 0, 0, 0.3)'
      )}
      zIndex={20}
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: useColorModeValue('#CBD5E0', '#4A5568'),
          borderRadius: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      }}
      {...rest}
    >
      {/* Header */}
      <Flex 
        h="20" 
        alignItems="center" 
        px={6} 
        justifyContent="space-between"
        borderBottom="1px solid"
        borderBottomColor={useColorModeValue('gray.100', 'gray.700')}
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
        backdropFilter="blur(10px)"
      >
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 15px rgba(102, 126, 234, 0.3)"
          >
            <Text fontSize="xl" fontWeight="bold" color="white">
              YT
            </Text>
          </Box>
          <VStack align="start" spacing={0}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
              bgClip="text"
              lineHeight={1}
            >
              YT Analyzer
            </Text>
            <Text fontSize="xs" color="gray.500" lineHeight={1}>
              {isPro ? 'Pro Account' : 'Free Account'}
            </Text>
          </VStack>
        </HStack>
        <CloseButton 
          display={{ base: 'flex', md: 'none' }} 
          onClick={onClose} 
          color={useColorModeValue('gray.600', 'gray.300')}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
          borderRadius="md"
        />
      </Flex>

      {/* Navigation */}
      <VStack spacing={2} align="stretch" px={4} py={6}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={useColorModeValue('gray.500', 'gray.400')}
          textTransform="uppercase"
          letterSpacing="wider"
          mb={2}
          px={3}
        >
          Navigation
        </Text>
        
        <AnimatePresence>
          {LinkItems.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavItem
                icon={link.icon}
                path={link.path}
                isActive={pathname === link.path}
                badge={link.badge}
                badgeColor={link.badgeColor}
                comingSoon={link.comingSoon}
              >
                {link.name}
              </NavItem>
            </motion.div>
          ))}
        </AnimatePresence>

        <Divider my={4} />

        {/* User Profile Section */}
        {session?.user && (
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="xl"
            p={4}
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            boxShadow="sm"
          >
            <HStack spacing={3} mb={3}>
              <Avatar
                size="md"
                src={session.user.image || ''}
                name={session.user.name || ''}
                bg="purple.500"
              />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                  {session.user.name || 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {session.user.email}
                </Text>
                <Badge
                  size="sm"
                  colorScheme={isPro ? 'purple' : 'gray'}
                  variant="subtle"
                >
                  {isPro ? 'Pro' : 'Free'}
                </Badge>
              </VStack>
            </HStack>
            
            <Button
              size="sm"
              width="full"
              variant="ghost"
              colorScheme="red"
              leftIcon={<FiLogOut />}
              onClick={() => signOut()}
              _hover={{
                bg: 'red.50',
                color: 'red.600',
              }}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  path: string
  isActive?: boolean
  children: ReactNode
  badge?: string
  badgeColor?: string
  comingSoon?: boolean
}

const NavItem = ({ 
  icon, 
  path, 
  isActive, 
  children, 
  badge, 
  badgeColor = 'blue',
  comingSoon,
  ...rest 
}: NavItemProps) => {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!comingSoon) {
      router.push(path)
    }
  }

  return (
    <Tooltip
      label={comingSoon ? 'Coming Soon' : ''}
      isDisabled={!comingSoon}
      placement="right"
    >
      <Link
        href="#"
        style={{ textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Flex
            align="center"
            p={3}
            mx={1}
            borderRadius="xl"
            role="group"
            cursor={comingSoon ? 'not-allowed' : 'pointer'}
            bg={isActive 
              ? useColorModeValue('white', 'gray.700')
              : 'transparent'
            }
            color={isActive 
              ? useColorModeValue('purple.600', 'purple.300')
              : useColorModeValue('gray.700', 'gray.300')
            }
            border="2px solid"
            borderColor={isActive 
              ? useColorModeValue('purple.200', 'purple.700')
              : 'transparent'
            }
            boxShadow={isActive 
              ? useColorModeValue('0 2px 8px rgba(139, 92, 246, 0.15)', '0 2px 8px rgba(139, 92, 246, 0.3)')
              : 'none'
            }
            opacity={comingSoon ? 0.6 : 1}
            transition="all 0.2s ease"
            _hover={!comingSoon ? {
              bg: useColorModeValue('purple.50', 'purple.900'),
              color: useColorModeValue('purple.700', 'purple.200'),
              transform: 'translateX(4px)',
            } : {}}
            {...rest}
          >
            <Icon
              mr={4}
              fontSize={18}
              as={icon}
              transition="all 0.2s ease"
            />
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              flex={1}
            >
              {children}
            </Text>
            
            <HStack spacing={2}>
              {badge && (
                <Badge
                  size="sm"
                  colorScheme={badgeColor}
                  variant="solid"
                  borderRadius="full"
                  fontSize="xs"
                >
                  {badge}
                </Badge>
              )}
              
              {(isActive || isHovered) && !comingSoon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Icon
                    as={FiChevronRight}
                    fontSize={14}
                    color={useColorModeValue('purple.400', 'purple.300')}
                  />
                </motion.div>
              )}
            </HStack>
          </Flex>
        </motion.div>
      </Link>
    </Tooltip>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
  subscription: { plan: string } | null
}

const MobileNav = ({ onOpen, subscription, ...rest }: MobileProps) => {
  const { data: session } = useSession()
  const router = useRouter()
  const isPro = subscription?.plan === 'pro'

  return (
    <Flex
      ml={{ base: 0, md: '280px' }}
      px={{ base: 4, md: 6 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)')}
      backdropFilter="blur(20px)"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.100', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow={useColorModeValue(
        '0 1px 3px rgba(0, 0, 0, 0.05)',
        '0 1px 3px rgba(0, 0, 0, 0.1)'
      )}
      {...rest}
    >
      <ChakraIconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="ghost"
        aria-label="open menu"
        icon={<FiMenu />}
        size="lg"
        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
      />

      <HStack spacing={3} display={{ base: 'flex', md: 'none' }}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
          bgClip="text"
        >
          YT Analyzer
        </Text>
        <Badge
          size="sm"
          colorScheme={isPro ? 'purple' : 'gray'}
          variant="subtle"
        >
          {isPro ? 'Pro' : 'Free'}
        </Badge>
      </HStack>

      <HStack spacing={4}>
        <Tooltip label="Notifications">
          <ChakraIconButton
            size="md"
            variant="ghost"
            aria-label="notifications"
            icon={<FiBell />}
            position="relative"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
          >
            <Box
              position="absolute"
              top={1}
              right={1}
              w={2}
              h={2}
              bg="red.500"
              borderRadius="full"
            />
          </ChakraIconButton>
        </Tooltip>

        <Menu>
          <MenuButton
            py={2}
            transition="all 0.3s"
            _focus={{ boxShadow: 'none' }}
          >
            <HStack spacing={3}>
              <Avatar
                size="sm"
                src={session?.user?.image || ''}
                name={session?.user?.name || ''}
                bg="purple.500"
                ring={2}
                ringColor={isPro ? 'purple.400' : 'gray.300'}
              />
              <VStack 
                display={{ base: 'none', md: 'flex' }} 
                alignItems="flex-start" 
                spacing={0}
              >
                <Text fontSize="sm" fontWeight="medium">
                  {session?.user?.name || 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {isPro ? 'Pro Account' : 'Free Account'}
                </Text>
              </VStack>
            </HStack>
          </MenuButton>
          
          <MenuList
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            boxShadow="xl"
            borderRadius="xl"
            border="1px solid"
            py={2}
          >
            <MenuItem 
              icon={<FiUser />}
              onClick={() => router.push('/profile')}
              _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              borderRadius="md"
              mx={2}
            >
              Profile
            </MenuItem>
            <MenuItem 
              icon={<FiSettings />}
              onClick={() => router.push('/dashboard/settings')}
              _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              borderRadius="md"
              mx={2}
            >
              Settings
            </MenuItem>
            <MenuItem 
              icon={<FiLogOut />}
              onClick={() => signOut()}
              _hover={{ bg: 'red.50', color: 'red.600' }}
              borderRadius="md"
              mx={2}
              color="red.500"
            >
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  )
}