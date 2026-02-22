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
import { Activity } from '@/types/classroom';

interface ActionPlanCalendarProps {
    actionPlans: Activity[];
}

type CalendarView = 'month' | 'week' | 'day';

export default function ActionPlanCalendar({ actionPlans }: ActionPlanCalendarProps) {
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

    const getPlansForDay = (date: Date) => {
        return actionPlans.filter(a => {
            if (!a.dueDate) return false;
            return isSameDay(new Date(a.dueDate), date);
        });
    };

    const renderMonthCell = (day: Date) => {
        const dayPlans = getPlansForDay(day);
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
                    {dayPlans.slice(0, 3).map(plan => (
                        <div key={plan.id} className="flex items-center gap-1.5 text-[10px] bg-primary/10 border border-primary/20 rounded px-1 py-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="truncate text-slate-300">{plan.title}</span>
                        </div>
                    ))}
                    {dayPlans.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">
                            +{dayPlans.length - 3} more
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderWeekColumn = (day: Date) => {
        const dayPlans = getPlansForDay(day);
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
                    {dayPlans.map(plan => (
                        <div key={plan.id} className="bg-white/5 border border-white/10 rounded-md p-2 text-xs">
                            <div className="font-semibold text-slate-200 mb-1">{plan.title}</div>
                            <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(plan.dueDate), 'HH:mm')}
                            </div>
                        </div>
                    ))}
                    {dayPlans.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic opacity-50">
                            No deadlines
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayPlans = getPlansForDay(currentDate);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                    <div>
                        <h3 className="text-xl font-bold text-white">{format(currentDate, 'EEEE, MMMM do, yyyy')}</h3>
                        <p className="text-sm text-muted-foreground">Deadlines</p>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                    {dayPlans.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No action plan deadlines for this day.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {dayPlans.map(plan => (
                                <div key={plan.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div>
                                        <div className="font-semibold text-white">{plan.title}</div>
                                        <div className="text-sm text-muted-foreground">{plan.description || 'No description'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Due at</div>
                                        <div className="text-sm font-mono text-primary">{format(new Date(plan.dueDate), 'HH:mm')}</div>
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
                        Action Plan Calendar
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
        </Card>
    );
}
