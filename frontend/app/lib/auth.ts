import {cookies} from 'next/headers'


export const isAuthenticated = async () => {
    const cookieStore = await cookies();
    const isLoggedIn = !!cookieStore.get("access_token");

    return isLoggedIn;
}