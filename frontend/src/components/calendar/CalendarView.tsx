"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Need to create this or use standard button
import { cn } from "@/lib/utils";
import { WeatherWidget } from "../dashboard/WeatherWidget";

// Mock data for initial events
const INITIAL_EVENTS = [
    {
        id: "1",
        title: "Team Meeting",
        start: new Date().toISOString().split("T")[0] + "T10:00:00",
        end: new Date().toISOString().split("T")[0] + "T11:00:00",
        backgroundColor: "#435663",
        borderColor: "#435663",
    },
    {
        id: "2",
        title: "Project Deadline",
        start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0],
        backgroundColor: "#A3B087",
        borderColor: "#A3B087",
    },
];

export function CalendarView() {
    const [events, setEvents] = useState(INITIAL_EVENTS);

    const handleDateClick = (arg: any) => {
        // TODO: Open add event modal
        alert("Date clicked: " + arg.dateStr);
    };

    const handleEventClick = (clickInfo: any) => {
        // TODO: Open edit/delete event modal
        alert("Event clicked: " + clickInfo.event.title);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <WeatherWidget />
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-custom-dark">Calendar</h2>
                <button
                    className="flex items-center gap-2 rounded-md bg-custom-slate px-4 py-2 text-sm font-medium text-white hover:bg-custom-dark focus:outline-none focus:ring-2 focus:ring-custom-slate focus:ring-offset-2"
                    onClick={() => alert("Add Event Clicked")}
                >
                    <Plus className="h-4 w-4" />
                    Add Event
                </button>
            </div>

            <div className="flex-1 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={events}
                    eventContent={renderEventContent} // custom render function
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    height="100%"
                />
            </div>
        </div>
    );
}

function renderEventContent(eventInfo: any) {
    return (
        <div className="overflow-hidden text-ellipsis whitespace-nowrap px-1">
            <i>{eventInfo.event.title}</i>
        </div>
    );
}
