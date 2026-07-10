import {NextResponse} from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request:NextRequest) {
    const token = request.cookies.get("access_token")?.value
    const path =  request.nextUrl.pathname;

    if(!token && path.startsWith("/protected")) {
        return NextResponse.redirect(new URL("/loginForm",request.url))
    }

    if(token && path === "/" ) {
        return NextResponse.redirect(new URL("/protected/chat",request.url))
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/","/protected/:path*","/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.+\\.[\\w]+$).*)"
]
}