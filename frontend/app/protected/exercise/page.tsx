"use client"

import Link from 'next/link'
import { EXERCISE_DATA } from './data'
import { Calendar, Dumbbell, ArrowRight, Lock } from 'lucide-react'

export default function ExercisesDashboard() {
    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-slate-50 p-6 md:p-10 overflow-x-hidden">
            {/* Header Section */}
            <h2 className='text-4xl text-center text-slate-700 mt-5 font-bold tracking-tight'>
                Select Your Exercise Month
            </h2>
            <p className="text-slate-500 text-lg mt-2 text-center max-w-xl">
                Choose to start your OpenCV interactive workspace and dynamic video demo guides.
            </p>

            {/* Sideways Sliding Row Container */}
            <div className="w-full max-w-6xl mt-12 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="flex gap-8 px-4 w-max">
                    {Object.keys(EXERCISE_DATA).map((key) => {
                        const exercise = EXERCISE_DATA[key];
                        const isUnlocked = exercise.monthNumber === 1;

                        // Unlocked cards link out dynamically; locked cards do nothing
                        return isUnlocked ? (
                            <Link 
                                href={`/protected/exercise/${key}`} 
                                key={key} 
                                className="w-[320px] md:w-[360px] h-[460px] border border-slate-100 p-5 rounded-2xl shadow-sm bg-white flex flex-col justify-between relative transition-all duration-300 select-none hover:shadow-md transform hover:-translate-y-1 cursor-pointer group"
                            >
                                <div className="flex flex-col gap-4">
                                    {/* Month Badge & Icon Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                                            <Calendar size={14} />
                                            Month {exercise.monthNumber}
                                        </div>
                                        <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                            <Dumbbell size={20} />
                                        </span>
                                    </div>

                                    {/* Exercise Image Banner */}
                                    <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-50">
                                        <img 
                                            src="/exercise1.jpg" 
                                            alt="Exercise Demo" 
                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop";
                                            }}
                                        />
                                    </div>

                                    {/* Title & Description */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-700 group-hover:text-emerald-600 transition-colors duration-200">
                                            {exercise.title.split(': ')[1] || exercise.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1.5 line-clamp-3 leading-relaxed">
                                            {exercise.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Action Row */}
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
                                        {exercise.expectedGesture.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity">
                                        Start 
                                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            /* Locked Static Card View */
                            <div 
                                key={key} 
                                className="w-[320px] md:w-[360px] h-[320px] border border-slate-100 p-5 rounded-2xl shadow-sm bg-white flex flex-col justify-between relative opacity-50 cursor-not-allowed select-none"
                            >
                                {/* Locked Overlay */}
                                <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-20 gap-2">
                                    <div className="bg-slate-800 text-white p-3 rounded-full shadow-md">
                                        <Lock size={20} />
                                    </div>
                                    <span className="text-xs uppercase tracking-widest font-bold text-slate-700 bg-slate-200/80 px-3 py-1 rounded-full">
                                        Coming Soon
                                    </span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-500">
                                            <Calendar size={14} />
                                            Month {exercise.monthNumber}
                                        </div>
                                        <span className="text-slate-200">
                                            <Dumbbell size={20} />
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-400">
                                            {exercise.title.split(': ')[1] || exercise.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1.5 line-clamp-3 leading-relaxed">
                                            {exercise.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md font-mono">
                                        {exercise.expectedGesture.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}