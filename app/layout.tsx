import './globals.css';import type {Metadata} from 'next';
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "@/components/analytics/MetaPixel";
export const metadata:Metadata={title:'Digital Store — Premium digital products',description:'Beautifully made digital products, delivered instantly.'};export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en">
    <body>
        <MetaPixel />
        {children}
         <GoogleAnalytics gaId="G-X7WRRW875R" />
        </body></html>}
