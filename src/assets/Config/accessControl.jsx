import { generalFunction } from "./generalFunction";
import { mainConfig } from "./appConfig";

const fetchUserPermission = async () => {
    const UserId = localStorage.getItem("varaUserId");
    return await generalFunction.fetchUserPermissionRole(UserId);
};

export const userPermissions = {

    canUserEdit: () => {
        const UserPermission = fetchUserPermission();
        if (UserPermission !== 'ADMIN' && UserPermission !== 'OWNER') {
            return false;
        }
        return true;
    },

    canUserAdd: () => {
        const UserPermission = fetchUserPermission();
        if (UserPermission !== 'ADMIN' && UserPermission !== 'OWNER') {
            return false;
        }
        return true;
    },

    canUserDelete: () => {
        const UserPermission = fetchUserPermission();
        if (UserPermission !== 'ADMIN' && UserPermission !== 'OWNER') {
            return false;
        }
        return true;
    },

    hasUserPermissions: async (page = null) => {
        try {
            const UserPermission = await fetchUserPermission();
            if (!UserPermission || !UserPermission[0] || !UserPermission[0].role) {
                return false;
            }

            const role = UserPermission[0].role;

            if (role === 'FIELD MANAGER' && page === 'Data Entry') {
                return true;
            } else if (role === 'FIELD MANAGER' && page !== 'Data Entry') {
                return false;
            } else if (role !== 'FIELD MANAGER' && page === 'Data Entry') {
                return false;
            } else if (role === 'NO_ROLE') {
                return false
            }
            return true;
        } catch (error) {
            console.error('Error fetching user permissions:', error);
            return false;
        }
    },

    hasUserSettingPermissions: async (settings = null) => {
        try {
            const UserPermission = await fetchUserPermission();
            if (!UserPermission || !UserPermission[0] || !UserPermission[0].role) {
                return false;
            }

            const role = UserPermission[0].role;

            if (role === 'FIELD MANAGER' && settings === 'manage') {
                return false;
            } else if (role === 'FIELD MANAGER' && settings === 'managefacilities') {
                return false;
            } else if (role === 'FIELD MANAGER' && settings === 'manageusers') {
                return false;
            } else if( role === 'NO_ROLE') {
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error fetching user permissions:', error);
            return false;
        }
    },

    userEntersDataEntry: async () => {
        const UserPermission = await fetchUserPermission();
        const role = UserPermission[0].role;
        if(role === 'FIELD MANAGER') {
            return true;
        }
        return false;
    }
}
