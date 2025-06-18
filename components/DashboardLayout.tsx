'use client'

import React, { ReactNode } from 'react'
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
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiUser,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

interface LinkItemProps {
  name: string
  icon: IconType
  path: string
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome, path: '/dashboard' },
  { name: 'Analytics', icon: FiTrendingUp, path: '/analytics-restults' },
  { name: 'History', icon: FiCompass, path: '/dashboard/history' },
  { name: 'Settings', icon: FiSettings, path: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')} style={{background: "f0f4ff"}}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
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
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box
      transition="all 0.3s ease"
      bg={useColorModeValue(
        'rgba(255, 255, 255, 0.1)', // Light mode: subtle glassmorphism
        'rgba(26, 32, 44, 0.1)', // Dark mode: subtle glassmorphism
      )}
      backdropFilter="blur(12px)" // Glassmorphism blur effect
      borderRight="1px solid"
      borderRightColor={useColorModeValue('rgba(229, 231, 235, 0.2)', 'rgba(55, 65, 81, 0.2)')}
      w={{ base: 'full', md: '280px' }} // Wider sidebar for modern look
      pos="fixed"
      h="full"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
      zIndex={10}
      {...rest}
      sx={{
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': {
          bg: useColorModeValue('gray.300', 'gray.600'),
          borderRadius: 'full',
        },
      }}
    >
      <Flex h="16" alignItems="center" px={6} justifyContent="space-between" borderBottom="1px solid" borderBottomColor={useColorModeValue('gray.100', 'gray.700')}>
        <Text
          fontSize="xl"
          fontWeight="black"
          letterSpacing="0.05em"
          bgGradient="linear(to-r, #6B46C1, #3B82F6)"
          bgClip="text"
        >
          YT Analyzer
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} color={useColorModeValue('gray.600', 'gray.300')} />
      </Flex>
      <VStack spacing={1} align="stretch" px={3} py={4} overflowY="auto" h="calc(100% - 64px)">
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            path={link.path}
            isActive={pathname === link.path}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease',
            }}
            sx={{
              borderRadius: 'md',
              px: 4,
              py: 3,
              fontWeight: 'medium',
              color: useColorModeValue(
                pathname === link.path ? 'purple.600' : 'gray.700',
                pathname === link.path ? 'purple.300' : 'gray.300',
              ),
              bg: pathname === link.path ? useColorModeValue('purple.50', 'purple.900') : 'transparent',
              transition: 'all 0.3s ease',
            }}
          >
            {link.name}
          </NavItem>
        ))}
        {session?.user?.email && (
          <Box px={3} mt="auto" mb={4}>
            <Button
              variant="solid"
              size="md"
              width="full"
              bgGradient="linear(to-r, #EF4444, #DC2626)"
              color="white"
              _hover={{
                bgGradient: 'linear(to-r, #DC2626, #B91C1C)',
                transform: 'scale(1.02)',
                boxShadow: 'md',
              }}
              _active={{ transform: 'scale(0.98)' }}
              transition="all 0.2s ease"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};


interface NavItemProps extends FlexProps {
  icon: IconType
  path: string
  isActive?: boolean
  children: ReactNode
}

const NavItem = ({ icon, path, isActive, children, ...rest }: NavItemProps) => {
  const router = useRouter()
  return (
    <Link
      href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      onClick={(e) => {
        e.preventDefault()
        router.push(path)
      }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'blue.400' : 'transparent'}
        color={isActive ? 'white' : 'inherit'}
        _hover={{
          bg: 'blue.400',
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <ChakraIconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        YT Analyzer
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
            >
              <HStack>
                <Avatar
                  size={'sm'}
                  src={session?.user?.image || ''}
                />
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem onClick={() => router.push('/dashboard/profile')}>Profile</MenuItem>
              <MenuItem onClick={() => router.push('/dashboard/settings')}>Settings</MenuItem>
              <MenuItem onClick={() => signOut()}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
} 