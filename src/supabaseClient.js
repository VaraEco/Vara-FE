import { createClient } from "@supabase/supabase-js";
import { mainConfig } from "./assets/Config/appConfig";
import Cookies from 'js-cookie';  // Import js-cookie

const isLocal = window.location.hostname === 'localhost';

let supabaseUrl, supabaseKey;

if (isLocal) {
    console.log('Running locally');
    supabaseUrl = mainConfig.REACT_APP_SUPABASE_URL_DEV;
    supabaseKey = mainConfig.REACT_APP_SUPABASE_ANON_KEY;
} else {
    console.log('Running on the cloud');
    supabaseUrl = mainConfig.REACT_APP_SUPABASE_URL_PROD;
    supabaseKey = mainConfig.REACT_APP_SUPABASE_ANON_KEY_PROD;
}


// Function to create a Supabase client with the current JWT
export const createSupabaseClient = (jwt) => {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
        }
    });
};

// Function to get the current JWT from cookies
const getJwtFromCookie = () => {
    return Cookies.get('auth-token');
};

// Initial Supabase client with JWT if available
export let supabase = createSupabaseClient(getJwtFromCookie());

// Function to update the Supabase client with a new JWT
export const updateSupabaseClient = (jwt) => {
    supabase = createSupabaseClient(jwt);
};