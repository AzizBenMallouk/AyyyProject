import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Absence, AbsenceType } from '@/types/classroom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AbsenceCalendarProps {
    absences: Absence[];
    absenceTypes: AbsenceType[];
    onAddAbsence?: () => void;
}

type CalendarView = 'month' | 'week' | 'day';

export default function AbsenceCalendar({ absences, absenceTypes, onAddAbsence }: AbsenceCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');

    const next = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const today = () => setCurrentDate(new Date());

    const getDays = () => {
        if (view === 'month') {
            const start = startOfWeek(startOfMonth(currentDate));
            const end = endOfWeek(endOfMonth(currentDate));
            return eachDayOfInterval({ start, end });
        } else if (view === 'week') {
            const start = startOfWeek(currentDate);
            const end = endOfWeek(currentDate);
            return eachDayOfInterval({ start, end });
        }
        return [currentDate];
    };

    const days = getDays();

    const getAbsencesForDay = (date: Date) => {
        return absences.filter(a => isSameDay(new Date(a.date), date));
    };

    const getAbsenceTypeColor = (typeName: string) => {
        switch (typeName) {
            case 'WHOLE_DAY': return 'bg-red-500';
            case 'HALF_DAY': return 'bg-orange-500';
            case 'LATE': return 'bg-yellow-500';
            default: return 'bg-slate-500';
        }
    };

    const renderMonthCell = (day: Date) => {
        const dayAbsences = getAbsencesForDay(day);
        const isCurrentMonth = isSameMonth(day, currentDate);

        return (
            <div
                key={day.toISOString()}
                className={`
                    min-h-[100px] border border-white/5 p-2 relative transition-colors group
                    ${!isCurrentMonth ? 'bg-black/20 opacity-50' : 'bg-black/40'}
                    ${isToday(day) ? 'bg-primary/5 border-primary/30' : ''}
                    hover:bg-white/5
                `}
                onClick={() => {
                    setCurrentDate(day);
                    setView('day');
                }}
            >
                <span className={`
                    text-xs font-mono mb-1 block
                    ${isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'}
                `}>
                    {format(day, 'd')}
                </span>
                <div className="space-y-1">
                    {dayAbsences.slice(0, 3).map(abs => (
                        <div key={abs.id} className="flex items-center gap-1.5 text-[10px] bg-white/5 rounded px-1 py-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${getAbsenceTypeColor(abs.absenceTypeName)}`} />
                            <span className="truncate text-slate-300">{abs.learnerName}</span>
                        </div>
                    ))}
                    {dayAbsences.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">
                            +{dayAbsences.length - 3} more
                        </div>
                    )}
                </div>
                {/* Hover Add Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Open add modal logic could go here
                        if (onAddAbsence) onAddAbsence();
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary/20 hover:bg-primary/40 text-primary rounded px-1.5 py-0.5"
                >
                    +
                </button>
            </div>
        );
    };

    const renderWeekColumn = (day: Date) => {
        const dayAbsences = getAbsencesForDay(day);
        const isTodayDay = isToday(day);

        return (
            <div key={day.toISOString()} className="flex-1 min-w-[140px] border-r border-white/10 last:border-r-0 flex flex-col">
                <div className={`
                    p-3 text-center border-b border-white/10
                    ${isTodayDay ? 'bg-primary/10' : ''}
                `}>
                    <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</div>
                    <div className={`text-xl font-bold ${isTodayDay ? 'text-primary' : 'text-white'}`}>
                        {format(day, 'd')}
                    </div>
                </div>
                <div className="flex-1 p-2 space-y-2 bg-black/20 min-h-[300px]">
                    {dayAbsences.map(abs => (
                        <div key={abs.id} className="bg-white/5 border border-white/10 rounded-md p-2 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${getAbsenceTypeColor(abs.absenceTypeName)}`} />
                                <span className="font-semibold text-slate-200">{abs.learnerName}</span>
                            </div>
                            <div className="text-muted-foreground pl-4 flex items-center gap-1">
                                {abs.absenceTypeName === 'LATE' && <Clock className="w-3 h-3" />}
                                {abs.absenceTypeName}
                            </div>
                        </div>
                    ))}
                    {dayAbsences.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic opacity-50">
                            No absences
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayAbsences = getAbsencesForDay(currentDate);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                    <div>
                        <h3 className="text-xl font-bold text-white">{format(currentDate, 'EEEE, MMMM do, yyyy')}</h3>
                        <p className="text-sm text-muted-foreground">Daily Absence Report</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{dayAbsences.length}</div>
                        <div className="text-xs text-muted-foreground uppercase">Total Absences</div>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                    {dayAbsences.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No absences recorded for this day.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {dayAbsences.map(abs => (
                                <div key={abs.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-lg font-bold border border-white/10`}>
                                            {abs.learnerName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{abs.learnerName}</div>
                                            <div className="text-sm text-muted-foreground">{abs.reason || 'No reason provided'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`
                                            px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                            ${abs.absenceTypeName === 'WHOLE_DAY' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                abs.absenceTypeName === 'HALF_DAY' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}
                                         `}>
                                            {abs.absenceTypeName}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl w-full">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Absence Calendar
                    </CardTitle>
                    <div className="h-4 w-[1px] bg-white/20 mx-2" />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prev} className="h-8 w-8 bg-white/5 border-white/10">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={next} className="h-8 w-8 bg-white/5 border-white/10">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={today} className="h-8 text-xs">Today</Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <h2 className="text-xl font-bold text-white tabular-nums">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>

                    <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="w-[180px]">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5 h-9">
                            <TabsTrigger value="day" className="text-xs">Day</TabsTrigger>
                            <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                            <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {view === 'month' && (
                    <div className="w-full">
                        <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-2 text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 auto-rows-fr">
                            {days.map(day => renderMonthCell(day))}
                        </div>
                    </div>
                )}

                {view === 'week' && (
                    <div className="w-full overflow-x-auto">
                        <div className="flex min-w-[800px]">
                            {days.map(day => renderWeekColumn(day))}
                        </div>
                    </div>
                )}

                {view === 'day' && (
                    <div className="p-6">
                        {renderDayView()}
                    </div>
                )}
            </CardContent>

            <div className="p-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-muted-foreground justify-end bg-black/20">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div> Whole Day
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div> Half Day
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Late Arrival
                </div>
            </div>
        </Card>
    );
}
