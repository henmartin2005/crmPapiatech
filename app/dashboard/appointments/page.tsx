import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";

export default function AppointmentsPage() {
    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            <AppointmentCalendar />
        </div>
    );
}
