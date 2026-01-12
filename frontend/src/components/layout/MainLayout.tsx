"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ChatInterface } from "../chat/ChatInterface";
import { cn } from "@/lib/utils";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

// Since we haven't fully set up shadcn's resizable component files yet, 
// I will implement a simplified version using the library directly or just standard flex for now 
// to avoid missing component errors until I create the ui/resizable.tsx.
// Actually, I should create ui/resizable.tsx first or just use the library components directly if possible.
// But shadcn components are usually copied into components/ui.
// For now, I will implement the layout logic using standard flex and state for simplicity and robustness 
// unless I strictly follow shadcn installation which copies files.
// Given I can't run 'npx shadcn-ui@latest add resizable', I have to manually create the component or use a custom implementation.
// I'll use a custom implementation with 'react-resizable-panels' directly in this file or a wrapper.



export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <ResizablePanelGroup direction="horizontal" autoSaveId="persistence">
                    <ResizablePanel defaultSize={100} minSize={30}>
                        <main className="h-full w-full overflow-y-auto p-6">
                            {children}
                        </main>
                    </ResizablePanel>

                    {isChatOpen && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                                <ChatInterface onClose={() => setIsChatOpen(false)} />
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>

                {/* Floating Action Button */}
                {!isChatOpen && (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="absolute bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-custom-slate text-white shadow-lg transition-transform hover:scale-110 hover:bg-custom-dark focus:outline-none focus:ring-2 focus:ring-custom-slate focus:ring-offset-2"
                        aria-label="Open AI Assistant"
                    >
                        <MessageCircle className="h-8 w-8" />
                    </button>
                )}
            </div>
        </div>
    );
}
