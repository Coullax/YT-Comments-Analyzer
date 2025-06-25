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
import { FiSettings } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

const SettingsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  const handleSaveSettings = () => {
    // Add your save settings logic here
    toast({
      title: 'Settings saved',
      description: 'Your settings have been successfully saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <DashboardLayout>

    <Box p={8} bg={useColorModeValue('white', 'gray.800')}>
      <Flex alignItems="center" mb={8}>
        <Icon as={FiSettings} fontSize={24} mr={4} />
        <Text fontSize="2xl" fontWeight="bold">
          Settings
        </Text>
      </Flex>

      <VStack spacing={6} align="start">
        <Text fontSize="lg" fontWeight="medium">
          Account Information
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

        <Text fontSize="lg" fontWeight="medium" mt={8}>
          Notifications
        </Text>
        <HStack w="full">
          <Text flex={1}>Receive notifications:</Text>
          <Input flex={2} placeholder="Email" />
        </HStack>

        <Text fontSize="lg" fontWeight="medium" mt={8}>
          Security
        </Text>
        <HStack w="full">
          <Text flex={1}>Change password:</Text>
          <Input flex={2} type="password" placeholder="New Password" />
        </HStack>
        <HStack w="full">
          <Text flex={1}>Confirm password:</Text>
          <Input flex={2} type="password" placeholder="Confirm Password" />
        </HStack>

        <Button
          colorScheme="purple"
          onClick={handleSaveSettings}
          mt={8}
          w="full"
        >
          Save Settings
        </Button>
      </VStack>
    </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;