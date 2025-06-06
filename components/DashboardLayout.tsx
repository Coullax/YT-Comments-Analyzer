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
  { name: 'Analytics', icon: FiTrendingUp, path: '/dashboard/analytics' },
  { name: 'History', icon: FiCompass, path: '/dashboard/history' },
  { name: 'Settings', icon: FiSettings, path: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
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
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          YT Analyzer
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <VStack spacing={4} align="stretch">
        {LinkItems.map((link) => (
          <NavItem 
            key={link.name} 
            icon={link.icon} 
            path={link.path}
            isActive={pathname === link.path}
          >
            {link.name}
          </NavItem>
        ))}
        {session?.user?.email && (
          <Box px={4} mt="auto">
            <Button
              variant="outline"
              colorScheme="red"
              width="full"
              onClick={() => signOut()}
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