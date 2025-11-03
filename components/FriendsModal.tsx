
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Friend, ToastType, Conversation, User, Message } from '../types';

interface FriendsModalProps {
    friends: Friend[];
    onClose: () => void;
    onAddToast: (message: string, type: ToastType) => void;
    currentUser: User;
    conversations: Conversation[];
    onSendMessage: (contactId: string, message: string) => void;
    onMarkAsRead: (contactId: string) => void;
}

const SendIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
)

const FriendsModal: React.FC<FriendsModalProps> = ({ friends, onClose, onAddToast, currentUser, conversations, onSendMessage, onMarkAsRead }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState<Friend | null>(null);

    const handleInviteFromContacts = async () => {
        const isContactsApiSupported = 'contacts' in navigator && 'select' in (navigator as any).contacts;
        const isTopFrame = window.self === window.top;

        if (isContactsApiSupported && isTopFrame) {
            try {
                const contacts = await (navigator as any).contacts.select(['name', 'email'], { multiple: true });
                if (contacts.length > 0) {
                    onAddToast(`Sent invites to ${contacts.length} contact(s)!`, 'success');
                } else {
                    onAddToast('Contact selection was cancelled.', 'info');
                }
            } catch (ex) {
                console.error('Contacts API error:', ex);
                onAddToast('Could not access contacts. The action may have been canceled.', 'info');
            }
        } else {
            // Simulate for unsupported browsers or when running in an iframe
            onAddToast('This feature is simulated. Sent invites to 2 contacts!', 'success');
        }
    };

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    const handleSelectContact = (friend: Friend) => {
        setSelectedContact(friend);
        onMarkAsRead(friend.id);
    };
    
    const conversationsMap = useMemo(() => {
        const map = new Map<string, Conversation>();
        conversations.forEach(c => map.set(c.contactId, c));
        return map;
    }, [conversations]);

    const filteredFriends = useMemo(() => {
        return friends
            .filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                const lastMsgA = conversationsMap.get(a.id)?.messages.slice(-1)[0];
                const lastMsgB = conversationsMap.get(b.id)?.messages.slice(-1)[0];
                const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
                const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
                return timeB - timeA;
            });
    }, [friends, searchTerm, conversationsMap]);

    const animationClasses = isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100';
    
    const ChatWelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select a conversation</h3>
            <p>Choose a friend from the list to start chatting.</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50" onClick={handleClose}>
            <div className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex transform transition-all duration-300 ease-in-out ${animationClasses}`} onClick={e => e.stopPropagation()}>
                {/* Contact List Panel */}
                <aside className="w-1/3 border-r border-slate-200 dark:border-slate-700/80 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h2>
                            <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">&times;</button>
                        </div>
                        <input type="text" placeholder="Search friends..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-2 focus:ring-indigo-500/80 focus:border-indigo-500"/>
                        <button onClick={handleInviteFromContacts} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"><span>Invite from Contacts</span></button>
                    </div>
                    <div className="flex-grow p-2 overflow-y-auto">
                        {filteredFriends.map(friend => {
                             const conversation = conversationsMap.get(friend.id);
                             const lastMessage = conversation?.messages.slice(-1)[0];
                             const unreadCount = conversation?.messages.filter(m => !m.isRead && m.senderId !== currentUser.id).length || 0;
                            return (
                                <button key={friend.id} onClick={() => handleSelectContact(friend)} className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors ${selectedContact?.id === friend.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                    <div className="relative flex-shrink-0">
                                        <img src={friend.profilePictureUrl} alt={friend.name} className="w-12 h-12 rounded-full" />
                                        {friend.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" />}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{friend.name}</p>
                                            {lastMessage && <p className="text-xs text-slate-400 flex-shrink-0">{new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm text-slate-500 dark:text-slate-400 truncate ${unreadCount > 0 && 'font-bold text-slate-700 dark:text-slate-200'}`}>{lastMessage?.text || 'No messages yet'}</p>
                                            {unreadCount > 0 && <span className="flex-shrink-0 ml-2 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </aside>
                {/* Chat Panel */}
                <main className="w-2/3 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                    {selectedContact ? <ChatWindow key={selectedContact.id} contact={selectedContact} conversation={conversationsMap.get(selectedContact.id)} currentUser={currentUser} onSendMessage={(message) => onSendMessage(selectedContact.id, message)} /> : <ChatWelcomeScreen />}
                </main>
            </div>
        </div>
    );
};

const ChatWindow: React.FC<{ contact: Friend, conversation?: Conversation, currentUser: User, onSendMessage: (message: string) => void }> = ({ contact, conversation, currentUser, onSendMessage }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation?.messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <>
            <header className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center space-x-3">
                <img src={contact.profilePictureUrl} alt={contact.name} className="w-10 h-10 rounded-full" />
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{contact.name}</h3>
                    <p className={`text-xs ${contact.isOnline ? 'text-green-500' : 'text-slate-500'}`}>{contact.isOnline ? 'Online' : 'Offline'}</p>
                </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {conversation?.messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === currentUser.id;
                    const prevMsg = conversation.messages[index-1];
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && <img src={contact.profilePictureUrl} alt={contact.name} className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? '' : 'invisible'}`} />}
                            <div className={`max-w-md p-3 rounded-2xl ${isCurrentUser ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                                <p>{msg.text}</p>
                            </div>
                             {isCurrentUser && <img src={currentUser.profilePictureUrl} alt={currentUser.name} className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? '' : 'invisible'}`} />}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700/80">
                <div className="relative">
                    <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="w-full bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-600/80 rounded-full py-3 pl-4 pr-12 focus:ring-indigo-500/80 focus:border-indigo-500" />
                    <button type="submit" disabled={!message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:bg-indigo-500 transition-colors"><SendIcon className="w-5 h-5"/></button>
                </div>
            </form>
        </>
    );
};

export default FriendsModal;
