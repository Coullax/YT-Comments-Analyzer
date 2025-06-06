'use client'

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Avatar,
  Text,
} from '@chakra-ui/react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl" py={4}>
        <Flex align="center">
          <Link href="/" passHref>
            <Heading size="md" cursor="pointer">
              YT Analyzer
            </Heading>
          </Link>

          <Spacer />

          <HStack spacing={4}>
            {status === 'loading' ? (
              <Text>Loading...</Text>
            ) : session ? (
              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    src={session.user?.image || undefined}
                    name={session.user?.name || 'User'}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                variant="outline"
                leftIcon={<FcGoogle />}
                onClick={()=>{router.push('/signin')}}
                suppressHydrationWarning
              >
                Sign In
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
} 