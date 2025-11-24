import {
    createUserProfile,
    deleteUserProfile,
    getProfileByAccountId,
    getProfileById,
    getUserprofile,
    updateUserProfile
} from '@/features/users/api/profile-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserprofile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProfileByAccountId = (accountId: string) => {
  return useQuery({
    queryKey: ['profile', 'account', accountId],
    queryFn: () => getProfileByAccountId(accountId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProfileById = (profileId: string) => {
  return useQuery({
    queryKey: ['profile', 'id', profileId],
    queryFn: () => getProfileById(profileId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateUserProfile = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      if (showToast) {
        Toast.show({
          type: 'success',
          text1: 'Profile updated successfully!',
        });
      }
    },
    onError: (error: unknown) => {
      if (showToast) {
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error as { message: string }).message 
          : 'Failed to update profile';
        Toast.show({
          type: 'error',
          text1: errorMessage,
        });
      }
    },
  });
};

export const useCreateUserProfile = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: createUserProfile,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      if (showToast) {
        Toast.show({
          type: 'success',
          text1: 'Profile created successfully!',
        });
      }
    },
    onError: (error: unknown) => {
      if (showToast) {
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error as { message: string }).message 
          : 'Failed to create profile';
        Toast.show({
          type: 'error',
          text1: errorMessage,
        });
      }
    },
  });
};

export const useDeleteUserProfile = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: deleteUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      if (showToast) {
        Toast.show({
          type: 'success',
          text1: 'Profile deleted successfully!',
        });
      }
    },
    onError: (error: unknown) => {
      if (showToast) {
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error as { message: string }).message 
          : 'Failed to delete profile';
        Toast.show({
          type: 'error',
          text1: errorMessage,
        });
      }
    },
  });
};


