'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  useColorModeValue,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

const ProfilePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  const handleSaveProfile = () => {
    // Add your save profile logic here
    toast({
      title: 'Profile saved',
      description: 'Your profile has been successfully saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <DashboardLayout>

    
    <Box p={8} bg={useColorModeValue('white', 'gray.800')}>
      <Flex alignItems="center" mb={8}>
        <Icon as={FiUser} fontSize={24} mr={4} />
        <Text fontSize="2xl" fontWeight="bold">
          Profile
        </Text>
      </Flex>

      <VStack spacing={6} align="start">
        <Text fontSize="lg" fontWeight="medium">
          Profile Information
        </Text>
        <HStack w="full">
          <Text flex={1}>Email:</Text>
          <Input
            flex={2}
            defaultValue={session?.user?.email || ''}
            placeholder="Email"
            isDisabled
          />
        </HStack>
        <HStack w="full">
          <Text flex={1}>Name:</Text>
          <Input
            flex={2}
            defaultValue={session?.user?.name || ''}
            placeholder="Name"
          />
        </HStack>
        <HStack w="full">
          <Text flex={1}>Bio:</Text>
          <Input flex={2} placeholder="Bio" />
        </HStack>

        <Button
          colorScheme="purple"
          onClick={handleSaveProfile}
          mt={8}
          w="full"
        >
          Save Profile
        </Button>
      </VStack>
    </Box>
    </DashboardLayout>
  );
};

export default ProfilePage;