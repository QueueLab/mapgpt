import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiGithub, SiTwitter } from 'react-icons/si'
import { Button } from './ui/button'

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 fixed bottom-0 left-0 bg-background text-foreground flex justify-center items-center">
      <div className="flex space-x-4">
        <Link href="https://discord.com" passHref>
          <Button variant="ghost" size="icon">
            <SiDiscord className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="https://github.com" passHref>
          <Button variant="ghost" size="icon">
            <SiGithub className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="https://twitter.com" passHref>
          <Button variant="ghost" size="icon">
            <SiTwitter className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </footer>
  )
}

export default Footer
