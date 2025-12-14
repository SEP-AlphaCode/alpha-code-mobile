import { PagedResult } from "@/types/page-result";
import { usersHttp } from "@/utils/http";
import { Profile } from "../types/profile";


export const getUserprofile = async () => {
    try {
        const response = await usersHttp.get<PagedResult<Profile>>(`/profiles`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const getProfileByAccountId = async (accountId: string) => {
    try {
        const response = await usersHttp.get<Profile>(`/profiles/account/${accountId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (profileData: Partial<Profile>) => {
    try {
        const response = await usersHttp.put<Profile>(`/profiles/${profileData.id}`, profileData);
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const getProfileById = async (id: string) => {
    try {
        const response = await usersHttp.get<Profile>(`/profiles/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};  

export const createUserProfile = async (profileData: Omit<Profile, 'id' | 'createDate' | 'lastUpdated'>) => {
    try {
        // Backend requires multipart/form-data format
        const formData = new FormData();
        formData.append('accountId', profileData.accountId);
        formData.append('name', profileData.name);
        formData.append('passCode', profileData.passcode); // Backend expects passCode, not passcode
        formData.append('isKid', profileData.isKid.toString());
        formData.append('status', profileData.status.toString());
        
        console.log('Sending FormData to /profiles:', {
            accountId: profileData.accountId,
            name: profileData.name,
            passCode: profileData.passcode,
            isKid: profileData.isKid,
            status: profileData.status
        });
        
        const response = await usersHttp.post<Profile>(`/profiles`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const deleteUserProfile = async (id: string) => {
    try {
        const response = await usersHttp.delete<void>(`/profiles/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user profile:", error);
        throw error;
    }
};

export const updateUserAvatar = async (id: string, avatarUrl: string) => {
    try {
        const response = await usersHttp.patch<Profile>(`/profiles/${id}/avatar`, { avartarUrl: avatarUrl });
        return response.data;
    } catch (error) {
        console.error("Error updating user avatar:", error);
        throw error;
    }
};

