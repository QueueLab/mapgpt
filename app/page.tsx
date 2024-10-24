import { Chat } from '@/components/chat';
import { AI } from './actions';
import { generateId } from 'ai'
import AccountSettings  from '@/components/settings/settings'; 

/**
 * The main page component for the application.
 * It initializes the AI state and renders the Chat component.
 * @returns {JSX.Element} - The rendered page component.
 */
export const maxDuration = 60;
  
export default function Page() {
  const id = generateId();

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} />
    </AI>
  );
}
