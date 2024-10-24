import { Chat } from '@/components/chat';
import { AI } from './actions';
import { generateId } from 'ai'


  export const maxDuration = 60;
  
  export default function Page() {
   

   
    const id = generateId();
    //const pathname = usePathname();
    
   /* if (pathname === '/settings') {
      return <AccountSettings />;
    }
      */

    return (
      <AI initialAIState={{ chatId: id, messages: [] }}>
        <Chat id={id} />
      </AI>
    );
  }
  
