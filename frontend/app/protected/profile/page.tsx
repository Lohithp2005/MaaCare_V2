"use client";

import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const [trimester, setTrimester] = useState<string>("2");
    const [healthDescription, setHealthDescription] = useState<string>(
        "Currently in my second trimester. Managing mild morning sickness but energy levels are stable. Focusing on keeping a healthy diet."
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {

            const response = await fetch("http://localhost:8000/user/profile-update", {
                method: "POST",
                "headers": {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    trimester,
                    healthDescription,
                }),
            });

            if (!response.ok) throw new Error();

            toast.success("Profile updated successfully!",{
                position: "top-center",
                autoClose: 2000,
            });
        } catch (error) {
            toast.error("Submission failed.",{
                position: "top-center",
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center h-full w-full p-5 bg-gray-50 min-h-screen text-slate-700">

            <h2 className="text-4xl text-center text-slate-600 mt-5 font-semibold">Maternal Health Profile</h2>
            <p className="text-slate-500 text-sm mt-1 text-center max-w-xl">
                Manage your pregnancy stage and symptoms to keep your AI tracking accurate.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-12 px-4">

                <div className="bg-white rounded-xl shadow p-6 border border-slate-100">
                    <h3 className="flex text-xl font-semibold text-slate-600 items-center gap-2 mb-4">
                        <span className="text-emerald-500"><Activity size={24} /></span>
                        Clinical Vitals & Vibe Checks
                    </h3>
                    <div className="border-t border-slate-100 mb-6 w-full"></div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Current Trimester</label>
                            <select
                                value={trimester}
                                onChange={(e) => setTrimester(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-400 font-medium"
                            >
                                <option value="1">1st Trimester (Weeks 1-12)</option>
                                <option value="2">2nd Trimester (Weeks 13-26)</option>
                                <option value="3">3rd Trimester (Weeks 27-40)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Health Description & Notes</label>
                            <textarea
                                value={healthDescription}
                                onChange={(e) => setHealthDescription(e.target.value)}
                                rows={6}
                                placeholder="Describe how you are feeling, food choices, or notes your doctor mentioned..."
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-400 leading-relaxed placeholder:text-slate-300"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? "Updating..." : "Update Health Parameters"}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}